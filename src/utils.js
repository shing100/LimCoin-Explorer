/*
 * 블록 타임스탬프(초)를 사람이 읽는 시각으로.
 *
 * 예전에는 `toUTCString()` 이라 "Thu, 10 Sep 2026 00:19:48 GMT" 가 나왔다.
 * 한국어 화면에 영어 GMT 문자열이 끼어 있었고, 무엇보다 표 칸에 안 들어가서
 * "Thu, 10 Sep 2026 00:19:48 …" 로 잘렸다 — 잘린 자리가 하필 시각이라
 * 정작 알고 싶은 값이 안 보였다.
 *
 * 이제 보는 이의 시간대로 짧게 적는다. locale 을 "ko-KR" 로 고정하는 것은
 * 화면 문구가 한국어이기 때문이다(브라우저 기본에 맡기면 같은 화면에
 * 9/10/2026 과 2026. 9. 10. 이 섞인다).
 */
export const makeDate = seconds => {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) {
    return "-";
  }
  const date = new Date(seconds * 1000);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }
  return date.toLocaleString("ko-KR", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  });
};

/*
 * 표 안에서는 "몇 분 전"이 훨씬 쓸모 있다 — 블록이 지금도 나오고 있는지를
 * 한눈에 보려는 것이지, 몇 시 몇 분에 나왔는지를 보려는 게 아니다.
 * 정확한 시각은 title 로 함께 단다.
 */
export const makeAgo = (seconds, now = Date.now()) => {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) {
    return "-";
  }
  const diff = Math.round(now / 1000) - seconds;
  if (diff < 0) {
    return "곧";
  }
  if (diff < 60) {
    return `${diff}초 전`;
  }
  if (diff < 3600) {
    return `${Math.floor(diff / 60)}분 전`;
  }
  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}시간 전`;
  }
  if (diff < 86400 * 30) {
    return `${Math.floor(diff / 86400)}일 전`;
  }
  return makeDate(seconds).slice(0, 12); // 오래됐으면 날짜만
};

export const stringToJSON = string => {
  try {
    return JSON.parse(string);
  } catch(e){
    console.error(e);
    return null;
  }
}

/*
 * 노드가 피어에게 보내는 메시지 종류. 익스플로러가 쓰는 것만 적는다.
 *
 * 노드는 새 블록을 붙이면 BLOCKCHAIN_RESPONSE 를, 트랜잭션을 받으면
 * MEMPOOL_RESPONSE 를 모든 소켓에 보낸다. 익스플로러는 피어인 척 붙어서
 * 그 둘을 듣는다.
 */
export const MESSAGE = {
  BLOCKS: "BLOCKCHAIN_RESPONSE",
  MEMPOOL: "MEMPOOL_RESPONSE"
};

// 배열을 담은 메시지면 { type, data } 를, 그 밖에는 null 을 돌려준다.
export const parseMessage = message => {
  if (typeof message.data !== "string") {
    return null;
  }
  const parsed = stringToJSON(message.data);
  if (parsed === null || !Array.isArray(parsed.data)) {
    return null;
  }
  return { type: parsed.type, data: parsed.data };
}

/*
 * 압축 목표값(bits, 노드의 target.js)에서 사람이 읽는 난이도를 낸다.
 *
 *   target = 가수 × 256^(지수−3),  난이도 = POW_LIMIT / target
 *
 * POW_LIMIT(바닥) 은 0x207fffff = 0x7fffff × 256^29 ≈ 2^255. 부동소수로도
 * 충분하다(2^255 는 double 범위 안이다) — 표시용이지 합의용이 아니다.
 */
const POW_LIMIT = 0x7fffff * Math.pow(256, 0x20 - 3);

export const difficultyFromBits = bits => {
  if (typeof bits !== "number" || !Number.isFinite(bits)) {
    return 0;
  }
  const exponent = Math.floor(bits / 0x1000000) & 0xff;
  const mantissa = bits & 0x007fffff;
  if (mantissa === 0) {
    return 0;
  }
  return POW_LIMIT / (mantissa * Math.pow(256, exponent - 3));
};

// 16384.12 -> "16,384", 1234567 -> "1.23M"
export const formatDifficulty = difficulty => {
  if (!Number.isFinite(difficulty) || difficulty <= 0) {
    return "-";
  }
  if (difficulty >= 1e9) return `${(difficulty / 1e9).toFixed(2)}G`;
  if (difficulty >= 1e6) return `${(difficulty / 1e6).toFixed(2)}M`;
  if (difficulty >= 1e4) return Math.round(difficulty).toLocaleString();
  return difficulty >= 100 ? difficulty.toFixed(0) : difficulty.toFixed(2);
};

/*
 * 주소 종류. 첫 글자로 가려진다 (SPEC 2절).
 *
 *   L / m,n  공개키 해시 (P2PKH) — 열쇠 하나로 쓴다
 *   M / 2    스크립트 (P2SH) — 다중서명·타임락·HTLC 같은 조건
 *   04…      예전 형식(공개키 hex 130자)
 */
export const addressKind = address => {
  if (typeof address !== "string") {
    return null;
  }
  if (/^04[0-9a-fA-F]{128}$/.test(address)) {
    return { label: "예전 형식", title: "공개키를 그대로 쓴 주소" };
  }
  if (/^[M2]/.test(address)) {
    return { label: "스크립트", title: "조건(다중서명·타임락 등)으로 잠긴 주소 (P2SH)" };
  }
  return null;
};
