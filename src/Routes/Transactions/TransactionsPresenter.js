import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import sum from "lodash.sum";
import { makeDate } from "../../utils";
import { CardBoard, TxHeader, TxRow } from "Components/Shared";

const TableContainer = styled.div`
  margin-top: 50px;
  margin-bottom: 100px;
`;

const TransactionsPresenter = ({ blocks, transactions } ) => (
  <Fragment>
    <TableContainer>
      <h2>Transactions</h2>
      <CardBoard>
        <TxHeader />
        {transactions.map((transaction, index) => (
          <TxRow
            timestamp={makeDate(transaction.timestamp)}
            id={transaction.id}
            insOuts={`${transaction.txIns.length}/${transaction.txOuts.length}`}
            amount={sum(transaction.txOuts.map(txOut => txOut.amount))}
            key={index}
          />
        ))}
      </CardBoard>
    </TableContainer>
  </Fragment>
);

TransactionsPresenter.propTypes = {
  transactions: PropTypes.array.isRequired
};

export default TransactionsPresenter;
