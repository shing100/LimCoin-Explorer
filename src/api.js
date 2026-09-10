import axios from "axios";
import { API_URL } from "./constants";

/*
 * 노드의 공개(읽기 전용) API 만 쓴다.
 * 지갑을 건드리는 엔드포인트는 토큰이 필요하고 CORS 도 막혀 있다 —
 * 익스플로러가 그쪽을 부를 일은 없다.
 */

export const getInfo = async () => (await axios.get(`${API_URL}/info`)).data;

// 노드는 최신순으로 한 페이지씩 준다. 전체 개수는 X-Total-Count 헤더에 있다.
export const getBlocks = async (limit, offset = 0) => {
  const res = await axios.get(`${API_URL}/blocks`, { params: { limit, offset } });
  return {
    blocks: res.data,
    total: Number(res.headers["x-total-count"]) || res.data.length
  };
};

export const getBlock = async hash =>
  (await axios.get(`${API_URL}/blocks/${hash}`)).data;

/*
 * 높이로 블록 하나.
 *
 * 예전에는 이 길이 없어서 /blocks 를 두 번 불렀다 — 한 번은 총 개수를 알려고,
 * 또 한 번은 (총 개수 - 1 - 높이) 를 offset 으로 넣어 한 개를 집으려고.
 * 그 사이에 블록이 하나 더 나오면 어긋나는 방법이기도 했다.
 */
export const getBlockByHeight = async height =>
  (await axios.get(`${API_URL}/blocks/height/${height}`)).data;

export const getTransaction = async id =>
  (await axios.get(`${API_URL}/transactions/${id}`)).data;

// 백서 8장. 블록 전체 대신 log2(n) 개 해시로 포함을 증명한다.
export const getTxProof = async id =>
  (await axios.get(`${API_URL}/transactions/${id}/proof`)).data;

export const getBalance = async address =>
  (await axios.get(`${API_URL}/address/${address}`)).data;

/*
 * 주소의 트랜잭션 내역.
 *
 * 예전에는 이런 게 없어서 주소 페이지가 잔액만 보여 줄 수 있었다.
 * 노드가 블록을 붙일 때 주소별로 색인해 두므로 그대로 받는다.
 */
export const getAddressTransactions = async (address, limit, offset = 0) => {
  const res = await axios.get(`${API_URL}/address/${address}/transactions`, {
    params: { limit, offset }
  });
  return {
    transactions: res.data,
    total: Number(res.headers["x-total-count"]) || res.data.length
  };
};

export const getAddressUtxos = async address =>
  (await axios.get(`${API_URL}/address/${address}/utxos`)).data;

export const getMempool = async () =>
  (await axios.get(`${API_URL}/transactions`)).data;

/*
 * 아래는 노드가 이미 주고 있었지만 화면이 없어 쓰지 않던 것들이다.
 * 만들어 놓고 확인할 창구가 없으면 없는 기능이나 마찬가지다.
 */

// 권장 수수료. 노드가 mempool 을 보고 계산한다.
export const getFees = async () => (await axios.get(`${API_URL}/fees`)).data;

// 붙어 있는 피어 (암호화 여부와 상대 노드 id 포함)
export const getPeerDetail = async () =>
  (await axios.get(`${API_URL}/peers/detail`)).data;

// 아는 피어 주소 (아직 안 붙은 것 포함)
export const getKnownPeers = async () =>
  (await axios.get(`${API_URL}/peers/known`)).data;

/*
 * P2SH 주소의 잠금 조건을 풀어 본다.
 *
 * M…/2… 주소는 "이 조건을 만족하면 쓸 수 있다"는 스크립트의 해시다.
 * 조건 자체는 쓰는 쪽이 공개할 때까지 아무도 모른다 — 그래서 redeemScript
 * 를 사람이 붙여 넣어야 한다.
 */
export const decodeScript = async redeemScript =>
  (await axios.post(`${API_URL}/script/decode`, { redeemScript })).data;

/*
 * 밖에서 서명한 트랜잭션을 이 노드에 넣는다.
 *
 * 콜드월렛이나 거래소는 키를 노드에 두지 않으므로, 서명은 밖에서 하고
 * 완성된 것만 던진다(EXCHANGE.md 4절). 지금까지는 curl 로만 할 수 있었다.
 */
export const broadcastRawTx = async tx =>
  (await axios.post(`${API_URL}/transactions/raw`, tx)).data;

/*
 * 최근 블록의 난이도·간격·트랜잭션 수. 차트 화면이 쓴다.
 *
 * /blocks 를 여러 페이지 받아 프론트에서 계산할 수도 있지만, 2000 블록을
 * 그리려면 본문까지 전부 받아야 한다(수백 MB). 노드는 헤더만 보고 만들 수
 * 있으므로 노드에서 만들어 준다.
 */
export const getBlockSeries = async (limit = 200) =>
  (await axios.get(`${API_URL}/stats/blocks`, { params: { limit } })).data;

// 잔액 많은 주소 순위
export const getRichList = async (limit = 50) =>
  (await axios.get(`${API_URL}/richlist`, { params: { limit } })).data;
