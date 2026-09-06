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
