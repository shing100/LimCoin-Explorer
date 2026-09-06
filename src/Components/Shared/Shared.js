import React from "react";
import styled, { css } from "styled-components";
import { radius, mono, breakpoint } from "../../theme";

export const Card = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: ${radius.lg};
  box-shadow: var(--shadow);
  overflow: hidden;
`;

export const SectionTitle = styled.h2`
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 14px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

export const SectionNote = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--textFaint);
`;

/*
 * 예전에는 RowContainer 안에서 `& * { width: 20% }` 로 칸 너비를 잡았다.
 * 자손 전부에 걸리는 데다 칸 수가 바뀌면 합이 100% 를 벗어나서,
 * 폭이 좁아지면 그대로 무너졌다. 표마다 열 정의를 갖는 grid 로 바꾼다.
 */
const layouts = {
  blocks: css`
    grid-template-columns: 72px minmax(0, 1fr) 190px 90px;
    @media (max-width: ${breakpoint.md}) {
      grid-template-columns: 56px minmax(0, 1fr) 80px;
    }
    @media (max-width: ${breakpoint.sm}) {
      grid-template-columns: 48px minmax(0, 1fr);
    }
  `,
  txs: css`
    grid-template-columns: 90px minmax(0, 1fr) 88px 190px;
    @media (max-width: ${breakpoint.md}) {
      grid-template-columns: 80px minmax(0, 1fr) 78px;
    }
    @media (max-width: ${breakpoint.sm}) {
      grid-template-columns: 72px minmax(0, 1fr);
    }
  `
};

const Row = styled.div`
  display: grid;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  ${props => layouts[props.layout]};
`;

export const HeadRow = styled(Row)`
  background: var(--surfaceSunken);
  border-bottom: 1px solid var(--border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--textMuted);
`;

export const BodyRow = styled(Row)`
  border-bottom: 1px solid var(--border);
  transition: background .12s;

  &:last-child { border-bottom: none; }
  &:hover { background: var(--surfaceSunken); }
`;

export const Cell = styled.span`
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  /* 좁은 화면에서 뒤쪽 칸부터 접는다 */
  ${props =>
    props.hideBelow === "md" &&
    css`
      @media (max-width: ${breakpoint.md}) { display: none; }
    `};
  ${props =>
    props.hideBelow === "sm" &&
    css`
      @media (max-width: ${breakpoint.sm}) { display: none; }
    `};
`;

// 해시와 트랜잭션 id 는 고정폭으로 둬야 자릿수를 눈으로 비교할 수 있다.
export const Hash = styled(Cell)`
  font-family: ${mono};
  font-size: 12.5px;
  color: var(--textMuted);
`;

export const Index = styled(Cell)`
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--accent);
`;

export const Num = styled(Cell)`
  font-variant-numeric: tabular-nums;
  font-weight: 600;
`;

export const Time = styled(Cell)`
  font-size: 12.5px;
  color: var(--textFaint);
`;

export const Empty = styled.p`
  padding: 44px 18px;
  text-align: center;
  color: var(--textFaint);
`;

export const BlocksHeader = () => (
  <HeadRow layout="blocks">
    <Cell>Index</Cell>
    <Cell>Hash</Cell>
    <Cell hideBelow="md">Timestamp</Cell>
    <Cell hideBelow="sm">Difficulty</Cell>
  </HeadRow>
);

export const BlocksRow = ({ index, hash, timestamp, difficulty }) => (
  <BodyRow layout="blocks">
    <Index>{index}</Index>
    <Hash title={hash}>{hash}</Hash>
    <Time hideBelow="md">{timestamp}</Time>
    <Num hideBelow="sm">{difficulty}</Num>
  </BodyRow>
);

export const TxHeader = () => (
  <HeadRow layout="txs">
    <Cell>Amount</Cell>
    <Cell>ID</Cell>
    <Cell hideBelow="sm">Ins/Outs</Cell>
    <Cell hideBelow="md">Timestamp</Cell>
  </HeadRow>
);

export const TxRow = ({ timestamp, id, insOuts, amount }) => (
  <BodyRow layout="txs">
    <Num>{amount} LIM</Num>
    <Hash title={id}>{id}</Hash>
    <Cell hideBelow="sm">{insOuts}</Cell>
    <Time hideBelow="md">{timestamp}</Time>
  </BodyRow>
);
