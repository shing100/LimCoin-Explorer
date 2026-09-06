import React from "react";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { radius, mono, breakpoint } from "../../theme";
import { formatLim } from "../../units";

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
    grid-template-columns: 110px 100px minmax(0, 1fr) 76px 170px;
    @media (max-width: ${breakpoint.md}) {
      grid-template-columns: 100px 90px minmax(0, 1fr) 70px;
    }
    @media (max-width: ${breakpoint.sm}) {
      grid-template-columns: 92px minmax(0, 1fr);
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

// 행 전체가 상세 페이지로 가는 링크가 된다
export const LinkRow = BodyRow.withComponent(Link).extend`
  color: inherit;
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

// 수수료는 대개 0 이라 본문보다 흐리게 둔다
export const Fee = styled(Cell)`
  font-variant-numeric: tabular-nums;
  font-size: 12.5px;
  color: var(--textFaint);
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
  <LinkRow layout="blocks" to={`/block/${hash}`}>
    <Index>{index}</Index>
    <Hash title={hash}>{hash}</Hash>
    <Time hideBelow="md">{timestamp}</Time>
    <Num hideBelow="sm">{difficulty}</Num>
  </LinkRow>
);

export const TxHeader = () => (
  <HeadRow layout="txs">
    <Cell>Amount</Cell>
    <Cell hideBelow="sm">Fee</Cell>
    <Cell>ID</Cell>
    <Cell hideBelow="sm">Ins/Outs</Cell>
    <Cell hideBelow="md">Timestamp</Cell>
  </HeadRow>
);

// fee 가 null 이면 입력을 되짚지 못한 경우(코인베이스 등)다.
/*
 * pending 이면 아직 블록에 담기지 않은 트랜잭션이다.
 * 시각도 수수료도 블록이 있어야 알 수 있으므로 그 자리에 표시를 둔다.
 */
export const TxRow = ({ timestamp, id, insOuts, amount, fee, pending }) => (
  <LinkRow layout="txs" to={`/tx/${id}`}>
    <Num>{formatLim(amount)}</Num>
    <Fee hideBelow="sm">
      {fee === null || fee === undefined ? "—" : formatLim(fee)}
    </Fee>
    <Hash title={id}>{id}</Hash>
    <Cell hideBelow="sm">{insOuts}</Cell>
    <Time hideBelow="md">{pending ? <Pill>대기 중</Pill> : timestamp}</Time>
  </LinkRow>
);


/* ----------------------------------------------- 상세 페이지 공용 */

export const Back = styled(Link)`
  display: inline-block;
  margin-bottom: 14px;
  font-size: 13px;
  color: var(--textMuted);
  &:hover { color: var(--accent); }
`;

// 키-값을 나열하는 상세 표
export const Detail = styled.dl`
  display: grid;
  grid-template-columns: 160px minmax(0, 1fr);
  gap: 0;
  margin: 0;

  @media (max-width: ${breakpoint.sm}) {
    grid-template-columns: 1fr;
  }
`;

export const DKey = styled.dt`
  padding: 11px 18px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--textMuted);
  border-bottom: 1px solid var(--border);

  @media (max-width: ${breakpoint.sm}) {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

export const DValue = styled.dd`
  min-width: 0;
  margin: 0;
  padding: 11px 18px;
  border-bottom: 1px solid var(--border);
  overflow-wrap: anywhere;
  ${props => props.mono && `font-family: ${mono}; font-size: 12.5px;`}
`;

export const MonoLink = styled(Link)`
  font-family: ${mono};
  font-size: 12.5px;
  color: var(--accent);
  overflow-wrap: anywhere;
  &:hover { text-decoration: underline; }
`;

export const Pill = styled.span`
  display: inline-block;
  padding: 2px 9px;
  border-radius: 999px;
  background: var(--accentSoft);
  color: var(--accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
`;

export const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-top: 18px;
  font-size: 13px;
  color: var(--textMuted);
`;

export const PagerButton = styled.button`
  padding: 7px 14px;
  border: 1px solid var(--border);
  border-radius: ${radius.sm};
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  &:disabled { opacity: .4; cursor: not-allowed; }
`;
