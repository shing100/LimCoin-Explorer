#!/usr/bin/env node
/**
 * 링크 미리보기를 위한 작은 정적 서버.
 *
 * 무엇을 푸는가:
 *   빌드된 익스플로러는 어느 주소로 들어와도 같은 index.html 을 준다. 제목과
 *   설명은 브라우저에서 자바스크립트가 돈 뒤에 바뀐다(src/meta.js). 그런데
 *   카카오톡·슬랙·트위터·디스코드의 링크 미리보기 봇은 **자바스크립트를
 *   돌리지 않는다.** HTML 을 받아 <title> 과 og: 태그를 읽고 끝이다. 그래서
 *   어떤 트랜잭션 링크를 뿌려도 미리보기는 늘 "LimCoin 익스플로러" 였다.
 *   익스플로러의 주된 쓰임이 링크를 뿌리는 것인데 그 쓰임이 반쯤 죽어 있었다.
 *
 * 어떻게 푸는가:
 *   내려 주기 직전에 index.html 의 제목·설명 태그만 그 경로에 맞는 값으로
 *   갈아 끼운다. 화면을 서버에서 그리는 진짜 SSR 은 아니다 — 리액트를 서버에서
 *   돌리려면 앱 구조를 바꿔야 하고, 얻는 것은 (봇이 이미 못 보는) 본문뿐이다.
 *   봇이 실제로 읽는 것은 <head> 뿐이므로 <head> 만 서버가 만든다.
 *
 * 쓰는 법:
 *   npm run build && npm run serve
 *   PORT=8080 API_URL=http://노드:3000 npm run serve
 *
 * 이 서버는 노드(블록체인)와 따로 돈다. 브라우저의 자바스크립트는 여전히
 * API_URL 로 직접 물어본다 — 여기서는 미리보기용 값만 대신 물어봐 준다.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { metaFor } = require("./meta");

const PORT = Number(process.env.PORT) || 5000;
const API_URL = (process.env.API_URL || "http://localhost:3000").replace(/\/$/, "");
const BUILD = path.resolve(__dirname, "..", "build");
// 미리보기 봇은 같은 링크를 여러 번 두드린다. 같은 답을 노드에 되묻지 않는다.
const CACHE_TTL = Number(process.env.META_CACHE_TTL || 30000);
const CACHE_MAX = 500;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webmanifest": "application/manifest+json",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".map": "application/json; charset=utf-8"
};

/*
 * HTML 에 넣기 전에 반드시 거른다.
 *
 * 값의 일부(주소·해시)는 요청 경로에서 온다. 거르지 않으면 링크 하나로
 * 남의 브라우저에서 스크립트를 돌릴 수 있다. meta.js 가 모양까지 검사하지만,
 * 검사와 이스케이프는 둘 다 있어야 한다 — 하나가 뚫려도 다른 하나가 막는다.
 */
const escapeHtml = value =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const cache = new Map();

const cached = async (key, make) => {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.until > now) {
    return hit.value;
  }
  const value = await make();
  if (cache.size >= CACHE_MAX) {
    // 가장 오래된 것부터 버린다 (Map 은 넣은 순서를 지킨다)
    cache.delete(cache.keys().next().value);
  }
  cache.set(key, { value, until: now + CACHE_TTL });
  return value;
};

/*
 * 노드에 물어본다. 실패하면 null — 미리보기 하나 때문에 화면이 안 뜨면 안 된다.
 * 노드가 죽어 있어도 익스플로러는 열려야 하고, 그때는 기본 미리보기가 나간다.
 */
const ask = async apiPath =>
  cached(`api:${apiPath}`, async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2500);
    try {
      const res = await fetch(`${API_URL}${apiPath}`, { signal: controller.signal });
      if (!res.ok) {
        return null;
      }
      return await res.json();
    } catch (e) {
      return null;
    } finally {
      clearTimeout(timer);
    }
  });

let template = null;
const readTemplate = () => {
  if (template === null) {
    template = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");
  }
  return template;
};

/*
 * 제목·설명 태그를 갈아 끼운다.
 *
 * 정규식으로 HTML 을 고치는 것은 보통 나쁜 생각이지만, 여기서 다루는 것은
 * 우리가 직접 쓴 public/index.html 한 장이고 대상 태그의 모양도 우리가 정한다.
 * 파서를 하나 매달 이유가 없다. 대신 바꾼 개수를 세어, 태그 이름을 고쳤는데
 * 여기를 안 고친 경우가 조용히 지나가지 않게 한다.
 */
const inject = (html, { title, description }, url, image) => {
  const t = escapeHtml(title);
  const d = escapeHtml(description);
  const img = escapeHtml(image);

  /*
   * 갈아 끼울 태그 목록. [찾을 것, 넣을 것] 쌍이다.
   *
   * og:image 는 값만 바꾸지 말고 **절대 URL** 로 바꿔야 한다. 정적 HTML 에는
   * "/icon-512.png" 로 적혀 있는데, 미리보기 봇은 그 상대 경로를 어디에
   * 붙여야 할지 모르는 경우가 많아 그림이 통째로 빠진다.
   */
  const swaps = [
    [/<title>[\s\S]*?<\/title>/, `<title>${t}</title>`],
    [/<meta name="description" content="[^"]*">/, `<meta name="description" content="${d}">`],
    [/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${t}">`],
    [
      /<meta property="og:description" content="[^"]*">/,
      `<meta property="og:description" content="${d}">`
    ],
    [/<meta property="og:image" content="[^"]*">/, `<meta property="og:image" content="${img}">`],
    [/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${t}">`],
    [
      /<meta name="twitter:description" content="[^"]*">/,
      `<meta name="twitter:description" content="${d}">`
    ],
    [/<meta name="twitter:image" content="[^"]*">/, `<meta name="twitter:image" content="${img}">`]
  ];

  let out = html;
  let changed = 0;
  swaps.forEach(([pattern, replacement]) => {
    out = out.replace(pattern, () => {
      changed++;
      return replacement;
    });
  });

  // og:url 은 원래 없다 — 경로를 알아야 쓸 수 있는 값이라 여기서 붙인다
  out = out.replace(
    "</head>",
    `<meta property="og:url" content="${escapeHtml(url)}"></head>`
  );

  /*
   * 하나라도 못 바꿨으면 조용히 넘기지 않는다. public/index.html 의 태그 모양이
   * 바뀌었는데 여기를 안 고치면, 미리보기가 다시 전부 같은 값으로 돌아간다 —
   * 화면은 멀쩡해 보이므로 아무도 알아채지 못한다.
   */
  if (changed !== swaps.length) {
    console.warn(
      `[meta] 태그 ${changed}/${swaps.length} 개만 바꿨습니다. ` +
        "public/index.html 의 메타 태그 모양이 바뀌었는지 확인하세요."
    );
  }
  return out;
};

const sendFile = (res, file) => {
  const type = MIME[path.extname(file)] || "application/octet-stream";
  /*
   * 이름에 해시가 박힌 산출물은 내용이 바뀌면 이름이 바뀐다 — 영원히 캐시해도
   * 된다. index.html 은 절대 캐시하면 안 된다(배포해도 옛 화면이 남는다).
   */
  const immutable = /\.[0-9a-f]{8}\./.test(path.basename(file));
  res.writeHead(200, {
    "Content-Type": type,
    "Cache-Control": immutable
      ? "public, max-age=31536000, immutable"
      : "public, max-age=300"
  });
  fs.createReadStream(file).pipe(res);
};

const server = http.createServer(async (req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { Allow: "GET, HEAD" });
    res.end("Method Not Allowed");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  } catch (e) {
    res.writeHead(400);
    res.end("Bad Request");
    return;
  }

  // 경로를 거슬러 올라가 build 밖의 파일을 읽어 가지 못하게
  const file = path.join(BUILD, pathname);
  if (!file.startsWith(BUILD)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  if (pathname !== "/" && fs.existsSync(file) && fs.statSync(file).isFile()) {
    sendFile(res, file);
    return;
  }

  // 화면 경로 — index.html 에 이 경로의 제목·설명을 넣어 내려 준다
  const host = req.headers["x-forwarded-host"] || req.headers.host || `localhost:${PORT}`;
  const proto = req.headers["x-forwarded-proto"] || "http";
  const meta = await metaFor(pathname, ask);
  const html = inject(
    readTemplate(),
    meta,
    `${proto}://${host}${pathname}`,
    `${proto}://${host}/icon-512.png`
  );

  res.writeHead(meta.ok ? 200 : 404, {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-cache"
  });
  res.end(req.method === "HEAD" ? undefined : html);
});

if (require.main === module) {
  if (!fs.existsSync(path.join(BUILD, "index.html"))) {
    console.error(`build 를 찾을 수 없습니다: ${BUILD}\n먼저 'npm run build' 를 하세요.`);
    process.exit(1);
  }
  server.listen(PORT, () => {
    console.log(`LimCoin 익스플로러: http://localhost:${PORT}  (노드 ${API_URL})`);
  });
}

module.exports = { server, inject, escapeHtml };
