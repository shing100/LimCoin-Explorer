/**
 * 화면마다 제목과 설명을 갈아 끼운다.
 *
 * 예전에는 모든 화면의 <title> 이 "LimCoin Explorer" 였다. 탭을 여러 개
 * 열면 어느 것이 어느 블록인지 알 수 없고, 북마크도 전부 같은 이름으로
 * 쌓였다. 익스플로러는 여러 창을 늘어놓고 견주는 도구인데 그게 안 됐다.
 *
 * 한계를 분명히 해 둔다. 이건 **브라우저에서 자바스크립트가 돈 뒤에**
 * 바뀌는 값이다.
 *
 *   - 탭 제목, 북마크, 방문 기록  → 바뀐다
 *   - 구글 등 JS 를 실행하는 크롤러 → 대체로 본다
 *   - 카카오톡·트위터 같은 링크 미리보기 봇 → **못 본다.**
 *     이 봇들은 HTML 을 받아 그대로 읽을 뿐 JS 를 돌리지 않는다.
 *     그쪽까지 맞추려면 서버가 화면마다 HTML 을 만들어 내려 줘야 한다(SSR).
 *     지금은 public/index.html 의 정적 기본값이 쓰인다.
 */
const SUFFIX = "LimCoin 익스플로러";

const setTag = (selector, attr, value) => {
  const el = document.head.querySelector(selector);
  if (el) {
    el.setAttribute(attr, value);
  }
};

/*
 * title 은 "무엇" 이 앞에 온다 — 탭이 좁아지면 뒤가 잘리기 때문이다.
 * "LimCoin 익스플로러 - 블록 #12" 로 적으면 좁은 탭에서 전부 똑같아 보인다.
 */
export const setPageMeta = (title, description) => {
  document.title = title ? `${title} · ${SUFFIX}` : SUFFIX;
  if (description) {
    setTag('meta[name="description"]', "content", description);
    setTag('meta[property="og:description"]', "content", description);
  }
  setTag('meta[property="og:title"]', "content", title ? `${title} · ${SUFFIX}` : SUFFIX);
  setTag('meta[name="twitter:title"]', "content", title ? `${title} · ${SUFFIX}` : SUFFIX);
};

// 긴 해시는 앞뒤만 남긴다 — 탭에서는 어차피 다 안 보인다
export const shorten = (value, head = 8, tail = 6) =>
  typeof value === "string" && value.length > head + tail + 1
    ? `${value.slice(0, head)}…${value.slice(-tail)}`
    : value || "";
