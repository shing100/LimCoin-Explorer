import React from "react";
import { makeAgo, makeDate, difficultyFromBits, formatDifficulty } from "../../utils";
import { Link } from "react-router-dom";
import styled, { css } from "styled-components";
import { radius, mono, breakpoint, space, tap } from "../../theme";
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
  gap: ${space.sm};
  margin: 0 0 ${space.md};
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
  gap: ${space.lg};
  padding: ${space.md} ${space.lg};
  ${props => layouts[props.layout]};

  /* 좁아지면 좌우 여백을 줄여 내용에 자리를 내준다 */
  @media (max-width: ${breakpoint.sm}) {
    gap: ${space.md};
    padding: ${space.md};
  }
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

const TimeCell = styled(Cell)`
  font-size: 12.5px;
  color: var(--textFaint);
`;

/*
 * 표 안의 시각.
 *
 * 초를 받아 "3분 전"으로 적고, 정확한 시각은 title 로 단다. 예전에는
 * 부르는 쪽이 미리 만든 긴 문자열을 넘겨서 칸에 안 들어가 잘렸다 —
 * 그것도 하필 시·분·초 자리에서.
 */
export const Time = ({ seconds, children, ...rest }) =>
  seconds === undefined ? (
    <TimeCell {...rest}>{children}</TimeCell>
  ) : (
    <TimeCell {...rest} title={makeDate(seconds)}>
      {makeAgo(seconds)}
    </TimeCell>
  );

export const Empty = styled.p`
  padding: ${space.huge} ${space.lg};
  text-align: center;
  color: var(--textFaint);
`;

export const BlocksHeader = () => (
  <HeadRow layout="blocks">
    <Cell>높이</Cell>
    <Cell>해시</Cell>
    <Cell hideBelow="md">시각</Cell>
    <Cell hideBelow="sm">난이도</Cell>
  </HeadRow>
);

// bits 는 노드의 압축 목표값. 사람이 읽는 난이도로 바꿔 보인다.
export const BlocksRow = ({ index, hash, timestamp, bits }) => (
  <LinkRow layout="blocks" to={`/block/${hash}`}>
    <Index>{index}</Index>
    <Hash title={hash}>{hash}</Hash>
    <Time hideBelow="md" seconds={timestamp} />
    <Num hideBelow="sm" title={`bits 0x${(bits || 0).toString(16)}`}>{formatDifficulty(difficultyFromBits(bits))}</Num>
  </LinkRow>
);

export const TxHeader = () => (
  <HeadRow layout="txs">
    <Cell>금액</Cell>
    <Cell hideBelow="sm">수수료</Cell>
    <Cell>트랜잭션 ID</Cell>
    <Cell hideBelow="sm">입력/출력</Cell>
    <Cell hideBelow="md">시각</Cell>
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
    {pending ? (
      <Time hideBelow="md">
        <Pill>대기 중</Pill>
      </Time>
    ) : (
      <Time hideBelow="md" seconds={timestamp} />
    )}
  </LinkRow>
);


/* ----------------------------------------------- 상세 페이지 공용 */

/*
 * 뒤로 가기. 글자 두 개뿐이라 누르는 자리가 26x20 밖에 안 됐다 —
 * 보이는 모양은 그대로 두고 좌우로 여백을 줘서 넓힌다.
 */
export const Back = styled(Link)`
  display: inline-flex;
  align-items: center;
  min-height: ${tap.mouse};
  padding: 0 ${space.sm};
  margin-left: -${space.sm};
  margin-bottom: ${space.sm};
  border-radius: ${radius.sm};
  font-size: 13px;
  color: var(--textMuted);

  &:hover { color: var(--accent); }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--accentSoft);
  }

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
  }
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
  padding: ${space.md} ${space.lg};
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
  padding: ${space.md} ${space.lg};
  border-bottom: 1px solid var(--border);
  overflow-wrap: anywhere;
  ${props => props.mono && `font-family: ${mono}; font-size: 12.5px;`}
`;

/*
 * 표 안의 긴 값(트랜잭션 id)으로 가는 링크.
 *
 * 글자 높이(15px)만큼만 눌렸다. 줄 전체가 링크인 다른 표와 달리 여기서는
 * 이것이 유일한 과녁이라, 줄 높이만큼 세로로 채운다.
 */
export const MonoLink = styled(Link)`
  display: flex;
  align-items: center;
  min-height: ${tap.mouse};
  font-family: ${mono};
  font-size: 12.5px;
  color: var(--accent);
  overflow-wrap: anywhere;

  &:hover { text-decoration: underline; }
  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--accentSoft);
    border-radius: ${radius.sm};
  }
`;

export const Pill = styled.span`
  display: inline-block;
  padding: 2px ${space.sm};
  border-radius: 999px;
  /* 카드 위에도 페이지 배경 위에도 얹히므로 바탕을 불투명하게 고정한다 */
  background: var(--accentBadge);
  color: var(--accentBadgeText);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.03em;
`;

export const Pager = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${space.md};
  margin-top: ${space.lg};
  font-size: 13px;
  color: var(--textMuted);
`;

export const PagerButton = styled.button`
  min-height: ${tap.mouse};
  padding: ${space.sm} ${space.lg};
  border: 1px solid var(--border);
  border-radius: ${radius.sm};
  background: var(--surface);
  color: var(--text);
  font: inherit;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) { border-color: var(--accent); color: var(--accent); }
  &:disabled { opacity: .4; cursor: not-allowed; }

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
  }
`;
