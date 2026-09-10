/**
 * 경로 하나를 보고 그 화면의 제목·설명을 만든다.
 *
 * 브라우저 안에서 하는 일(src/meta.js)과 같은 값을 만들지만, 이쪽은 HTML 을
 * 내려 주기 **전에** 서버에서 만든다. 링크 미리보기 봇은 자바스크립트를
 * 돌리지 않으므로 그 방법밖에 없다.
 */
const SUFFIX = "LimCoin 익스플로러";

const DEFAULT_DESCRIPTION =
  "LimCoin 블록체인 익스플로러. 블록, 트랜잭션, 주소를 찾아보고 네트워크 상태와 수수료를 확인합니다.";

// 값이 있는 화면이 아닌, 고정된 화면들
const STATIC = {
  "/": [null, DEFAULT_DESCRIPTION],
  "/blocks": ["블록", "LimCoin 블록 목록. 높이, 해시, 시각, 난이도."],
  "/transactions": ["트랜잭션", "LimCoin 최근 트랜잭션과 대기 중인 트랜잭션."],
  "/charts": ["차트", "LimCoin 난이도, 블록 간격, 블록당 트랜잭션 수의 최근 흐름."],
  "/richlist": ["부자 목록", "LimCoin 잔액이 많은 주소 순위. 주소 순위이지 사람 순위가 아닙니다."],
  "/network": ["네트워크", "LimCoin 노드 상태, 붙어 있는 피어, 권장 수수료."],
  "/broadcast": ["트랜잭션 보내기", "밖에서 서명한 raw 트랜잭션을 이 노드에 넣습니다."],
  "/api": ["API", "LimCoin 노드의 공개 REST API 와 JSON-RPC 사용법."]
};

/*
 * 값의 모양을 먼저 본다.
 *
 * 경로에서 꺼낸 글자를 그대로 노드에 넘기거나 HTML 에 넣지 않는다. 이스케이프
 * 를 하더라도, 애초에 있을 수 없는 모양이면 조회할 것도 없다.
 */
const isHash = value => /^[0-9a-f]{64}$/i.test(value);
const isHeight = value => /^\d{1,12}$/.test(value);
const isAddress = value => /^[13-9A-HJ-NP-Za-km-z]{20,80}$/.test(value);

const COIN = 100000000;
const lim = amount => (amount / COIN).toLocaleString("ko-KR", { maximumFractionDigits: 8 });

const shorten = (value, head = 8, tail = 6) =>
  typeof value === "string" && value.length > head + tail + 1
    ? `${value.slice(0, head)}…${value.slice(-tail)}`
    : value || "";

/**
 * @param pathname  요청 경로 (쿼리 제외)
 * @param ask       노드에 물어보는 함수. (경로) => Promise<객체|null>
 * @returns {{title: string, description: string, ok: boolean}}
 */
const metaFor = async (pathname, ask) => {
  const path = pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

  if (Object.prototype.hasOwnProperty.call(STATIC, path)) {
    const [name, description] = STATIC[path];
    return { title: name ? `${name} · ${SUFFIX}` : SUFFIX, description, ok: true };
  }

  const parts = path.split("/").filter(Boolean);

  if (parts.length === 2) {
    const [kind, raw] = parts;
    const value = decodeURIComponent(raw);

    if (kind === "block" && isHash(value)) {
      const block = await ask(`/blocks/${value}`);
      if (block) {
        return {
          title: `블록 #${block.index} · ${SUFFIX}`,
          description:
            `트랜잭션 ${Array.isArray(block.data) ? block.data.length : 0}건 · ` +
            `해시 ${shorten(block.hash)} · ${new Date(block.timestamp * 1000).toISOString()}`,
          ok: true
        };
      }
    }

    if (kind === "height" && isHeight(value)) {
      const block = await ask(`/blocks/height/${value}`);
      if (block) {
        return {
          title: `블록 #${block.index} · ${SUFFIX}`,
          description:
            `트랜잭션 ${Array.isArray(block.data) ? block.data.length : 0}건 · ` +
            `해시 ${shorten(block.hash)}`,
          ok: true
        };
      }
    }

    if (kind === "tx" && isHash(value)) {
      const tx = await ask(`/transactions/${value}`);
      if (tx) {
        const out = (tx.txOuts || []).reduce((sum, o) => sum + o.amount, 0);
        return {
          title: `트랜잭션 ${shorten(value)} · ${SUFFIX}`,
          description:
            `보낸 값 ${lim(out)} LIM · 입력 ${(tx.txIns || []).length}개 · ` +
            `출력 ${(tx.txOuts || []).length}개`,
          ok: true
        };
      }
    }

    if (kind === "address" && isAddress(value)) {
      const info = await ask(`/address/${value}`);
      if (info) {
        return {
          title: `주소 ${shorten(value, 6, 6)} · ${SUFFIX}`,
          description: `잔액 ${lim(info.balance)} LIM · ${value}`,
          ok: true
        };
      }
    }
  }

  /*
   * 못 찾았거나 모양이 이상한 경로. 제목을 "없는 페이지"로 두고 404 로 준다 —
   * 검색엔진이 오탈자 링크를 색인해 두지 않게.
   */
  return {
    title: `찾을 수 없음 · ${SUFFIX}`,
    description: "요청한 블록·트랜잭션·주소를 찾지 못했습니다.",
    ok: false
  };
};

module.exports = { metaFor, SUFFIX, DEFAULT_DESCRIPTION, isHash, isHeight, isAddress };
