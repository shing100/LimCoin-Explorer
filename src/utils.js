export const makeDate = seconds => {
  if (typeof seconds !== "number" || Number.isNaN(seconds)) {
    return "-";
  }
  const date = new Date(null);
  date.setSeconds(seconds);
  return date.toUTCString();
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
