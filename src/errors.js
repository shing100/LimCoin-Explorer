/**
 * 노드가 준 오류 문구를 사람이 읽는 한국어로.
 *
 * 노드의 REST 응답은 영어다("Tx not found", "Invalid address"). 그걸 그대로
 * 화면에 뿌리고 있어서, 온통 한국어인 화면에 영어 한 줄이 튀어나왔다.
 * 게다가 "Tx not found" 는 원인을 말해 주지 않는다 — 오타인지, 아직 안
 * 퍼진 트랜잭션인지, 밀려난 것인지.
 *
 * 노드 쪽 문구를 바꾸지 않는 이유: 그건 API 응답이라 거래소 연동 코드가
 * 문자열을 보고 갈래를 탈 수 있다. 화면에서만 옮긴다.
 */
const TABLE = [
  [/tx not found/i, "그 트랜잭션을 찾을 수 없습니다. id 를 다시 확인해 주세요. 방금 보낸 것이라면 아직 이 노드에 닿지 않았을 수 있습니다."],
  [/block not found/i, "그 블록을 찾을 수 없습니다. 해시를 다시 확인해 주세요."],
  [/invalid address/i, "주소 형식이 올바르지 않습니다. 이 망의 주소가 맞는지 확인해 주세요."],
  [/address not found/i, "그 주소로 오간 트랜잭션이 없습니다."],
  [/not found/i, "찾을 수 없습니다."],
  [/network ?error|ECONNREFUSED|Failed to fetch/i, "노드에 연결할 수 없습니다. 노드가 떠 있는지 확인해 주세요."],
  [/timeout/i, "노드가 제때 답하지 않았습니다. 잠시 뒤 다시 시도해 주세요."]
];

export const toKorean = raw => {
  if (raw === null || raw === undefined) {
    return "알 수 없는 오류입니다.";
  }
  // 노드가 { error: "..." } 로 줄 때도 있다
  const text = typeof raw === "string" ? raw : raw.error || raw.message || String(raw);
  for (const [pattern, korean] of TABLE) {
    if (pattern.test(text)) {
      return korean;
    }
  }
  // 이미 한국어면 그대로 (노드도 일부는 한국어로 답한다)
  return text;
};
