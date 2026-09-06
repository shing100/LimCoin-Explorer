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
