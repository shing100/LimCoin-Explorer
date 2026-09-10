import React, { Fragment } from "react";
import PropTypes from "prop-types";
import sum from "lodash.sum";
import Pending from "Components/Pending";
import {
  Card, SectionTitle, SectionNote, TxHeader, TxRow, Empty
} from "Components/Shared";

const TransactionsPresenter = ({ transactions, mempool, mempoolFees }) => (
  <Fragment>
    <Pending transactions={mempool} totalFees={mempoolFees} />
    <section style={{ marginTop: mempool.length > 0 ? 34 : 0 }}>
      <SectionTitle>
        확정된 트랜잭션
        <SectionNote>{transactions.length}개 표시 중</SectionNote>
      </SectionTitle>
      <Card>
        <TxHeader />
        {transactions.length === 0 ? (
          <Empty>아직 트랜잭션이 없습니다.</Empty>
        ) : (
          transactions.map(transaction => (
            <TxRow
              timestamp={transaction.timestamp}
              id={transaction.id}
              insOuts={`${transaction.txIns.length}/${transaction.txOuts.length}`}
              amount={sum(transaction.txOuts.map(txOut => txOut.amount))}
              fee={transaction.fee}
              key={transaction.id}
            />
          ))
        )}
      </Card>
    </section>
  </Fragment>
);

TransactionsPresenter.propTypes = {
  transactions: PropTypes.array.isRequired,
  mempool: PropTypes.array.isRequired,
  mempoolFees: PropTypes.number
};

export default TransactionsPresenter;
