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

// 블록체인 응답이면 블록 배열을, 그 밖에는 null 을 돌려준다.
export const parseMessage = message => {
  if (typeof message.data !== "string") {
    return null;
  }
  const parsed = stringToJSON(message.data);
  if (parsed === null || parsed.type !== "BLOCKCHAIN_RESPONSE") {
    return null;
  }
  return Array.isArray(parsed.data) ? parsed.data : null;
}
