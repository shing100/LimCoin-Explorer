import React from "react";
import { formatDifficulty } from "../../utils";
import PropTypes from "prop-types";
import styled from "styled-components";
import { radius, breakpoint } from "../../theme";
import { formatLim } from "../../units";

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-top: 4px;

  @media (max-width: ${breakpoint.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Tile = styled.div`
  padding: 16px 18px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: ${radius.md};
`;

const Key = styled.p`
  margin: 0 0 4px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--textMuted);
`;

const Value = styled.p`
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const Unit = styled.span`
  margin-left: 5px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
`;

const Stats = ({ height, txCount, difficulty, supply }) => (
  <Grid>
    <Tile>
      <Key>블록 높이</Key>
      <Value>{height}</Value>
    </Tile>
    <Tile>
      <Key>트랜잭션</Key>
      <Value>{txCount.toLocaleString()}</Value>
    </Tile>
    <Tile>
      <Key>현재 난이도</Key>
      <Value>{formatDifficulty(difficulty)}</Value>
    </Tile>
    <Tile>
      <Key>총 발행량</Key>
      <Value>
        {formatLim(supply)}
        <Unit>LIM</Unit>
      </Value>
    </Tile>
  </Grid>
);

Stats.propTypes = {
  height: PropTypes.number.isRequired,
  txCount: PropTypes.number.isRequired,
  difficulty: PropTypes.number.isRequired,
  supply: PropTypes.number.isRequired
};

export default Stats;
