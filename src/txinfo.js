import flatten from "lodash.flatten";

/*
 * 트랜잭션 자체에는 시간도 수수료도 들어 있지 않다.
 *
 *  - 시간   : 담고 있는 블록의 timestamp 를 쓴다
 *  - 수수료 : 백서 6장대로 "입력합 - 출력합" 이다. 그런데 txIn 은 이전 출력을
 *             (txOutId, txOutIndex) 로 가리킬 뿐 금액을 갖고 있지 않으므로,
 *             체인 전체의 출력을 색인해 두고 되짚어야 한다.
 */
const indexOutputs = blocks => {
  const index = new Map();
  blocks.forEach(block =>
    (block.data || []).forEach(tx =>
      tx.txOuts.forEach((txOut, i) => index.set(`${tx.id}:${i}`, txOut))
    )
  );
  return index;
};

const isCoinbase = tx => tx.txIns.length === 1 && tx.txIns[0].txOutId === "";

const sumOuts = tx => tx.txOuts.reduce((sum, txOut) => sum + txOut.amount, 0);

// 블록 목록을 트랜잭션 목록으로 펼치면서 시간과 수수료를 붙인다.
export const enrichTransactions = blocks => {
  const outputs = indexOutputs(blocks);

  return flatten(
    blocks.map(block =>
      (block.data || []).map(tx => {
        let fee = null;
        if (!isCoinbase(tx)) {
          // 참조하는 출력을 하나라도 찾지 못하면 수수료를 계산할 수 없다
          let inputs = 0;
          const resolved = tx.txIns.every(txIn => {
            const source = outputs.get(`${txIn.txOutId}:${txIn.txOutIndex}`);
            if (!source) {
              return false;
            }
            inputs += source.amount;
            return true;
          });
          if (resolved) {
            fee = inputs - sumOuts(tx);
          }
        }
        return {
          ...tx,
          timestamp: block.timestamp,
          blockIndex: block.index,
          fee
        };
      })
    )
  );
};
