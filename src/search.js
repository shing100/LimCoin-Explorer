/**
 * 검색어를 노드에 물어보고 갈 곳을 정한다.
 *
 * 블록 해시와 트랜잭션 id 는 둘 다 64자 16진수라 겉모습으로는 가릴 수
 * 없다. 예전에는 블록을 먼저 찔러 보고 실패하면 트랜잭션으로 넘어갔는데,
 * 정상 동작인데도 실패한 요청이 콘솔에 남았다. 노드는 둘 다 알고 있으므로
 * 한 번에 답해 준다.
 */
import axios from "axios";
import { API_URL } from "./constants";

export const resolveQuery = async raw => {
  const query = raw.trim();
  if (query === "") {
    return null;
  }

  try {
    const { data } = await axios.get(`${API_URL}/search/${encodeURIComponent(query)}`);
    if (data.type === "block") {
      return { path: `/block/${data.hash}` };
    }
    if (data.type === "tx") {
      return { path: `/tx/${data.id}` };
    }
    return { path: `/address/${data.address}` };
  } catch (e) {
    const message = e.response && e.response.data;
    return { error: message || "검색에 실패했습니다. 노드에 연결되어 있는지 확인하세요." };
  }
};
