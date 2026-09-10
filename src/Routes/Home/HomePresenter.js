import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import sum from "lodash.sum";
import Stats from "Components/Stats";
import Pending from "Components/Pending";
import {
  Card, SectionTitle, SectionNote, BlocksHeader, BlocksRow,
  TxHeader, TxRow, Empty
} from "Components/Shared";

const Section = styled.section`
  margin-bottom: 34px;

  &:last-child { margin-bottom: 0; }
`;

const HomePresenter = ({ blocks, transactions, stats, mempool, mempoolFees }) => (
  <Fragment>
    <Section>
      <Stats {...stats} />
    </Section>

    {mempool.length > 0 && (
      <Section>
        <Pending transactions={mempool} totalFees={mempoolFees} />
      </Section>
    )}

    <Section>
      <SectionTitle>
        최근 블록
        <SectionNote>가장 최근 {blocks.length}개</SectionNote>
      </SectionTitle>
      <Card>
        <BlocksHeader />
        {blocks.length === 0 ? (
          <Empty>아직 블록이 없습니다.</Empty>
        ) : (
          blocks.map(block => (
            <BlocksRow
              index={block.index}
              hash={block.hash}
              timestamp={block.timestamp}
              bits={block.bits}
              key={block.hash}
            />
          ))
        )}
      </Card>
    </Section>

    <Section>
      <SectionTitle>
        최근 트랜잭션
        <SectionNote>가장 최근 {transactions.length}개</SectionNote>
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
    </Section>
  </Fragment>
);

HomePresenter.propTypes = {
  blocks: PropTypes.array.isRequired,
  transactions: PropTypes.array.isRequired,
  stats: PropTypes.object.isRequired,
  mempool: PropTypes.array.isRequired,
  mempoolFees: PropTypes.number
};

export default HomePresenter;
