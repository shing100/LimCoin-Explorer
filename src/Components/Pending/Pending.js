import React from "react";
import PropTypes from "prop-types";
import sum from "lodash.sum";
import { formatLim } from "../../units";
import {
  Card, SectionTitle, SectionNote, TxHeader, TxRow, Empty
} from "Components/Shared";

/*
 * 아직 블록에 담기지 않은 트랜잭션(mempool).
 *
 * 지금까지 익스플로러는 확정된 것만 보여 줬다. 보낸 사람 입장에서는
 * 블록이 나올 때까지 아무 흔적도 없어서, 보내진 건지 알 수 없었다.
 *
 * 수수료는 입력이 가리키는 이전 출력을 되짚어야 알 수 있고 그건 노드만
 * 할 수 있다. 목록에서는 비워 두고, 합계만 /info 의 mempoolFees 로 받는다.
 */
const Pending = ({ transactions, totalFees }) => {
  if (transactions.length === 0) {
    return null;
  }
  return (
    <section>
      <SectionTitle>
        대기 중인 트랜잭션
        <SectionNote>
          {transactions.length}건
          {typeof totalFees === "number" && totalFees > 0 &&
            ` · 수수료 합계 ${formatLim(totalFees)} LIM`}
        </SectionNote>
      </SectionTitle>
      <Card>
        <TxHeader />
        {transactions.length === 0 ? (
          <Empty>대기 중인 트랜잭션이 없습니다.</Empty>
        ) : (
          transactions.map(transaction => (
            <TxRow
              pending
              id={transaction.id}
              insOuts={`${transaction.txIns.length}/${transaction.txOuts.length}`}
              amount={sum(transaction.txOuts.map(txOut => txOut.amount))}
              fee={null}
              key={transaction.id}
            />
          ))
        )}
      </Card>
    </section>
  );
};

Pending.propTypes = {
  transactions: PropTypes.array.isRequired,
  totalFees: PropTypes.number
};

export default Pending;
