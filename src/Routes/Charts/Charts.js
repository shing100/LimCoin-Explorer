import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { SectionTitle, Empty } from "Components/Shared";
import Chart from "Components/Chart";
import { getBlockSeries } from "../../api";
import { setPageMeta } from "../../meta";
import { toKorean } from "../../errors";
import { formatDifficulty } from "../../utils";
import { downloadCsv } from "../../csv";
import { radius, space, breakpoint, tap } from "../../theme";

/*
 * 체인 차트.
 *
 * 왜 필요한가: 숫자 하나("난이도 645,299")로는 이 체인이 건강한지 알 수 없다.
 * 난이도가 오르내리는 모양, 블록이 목표 간격을 지키는지, 실제로 쓰이고
 * 있는지(블록당 트랜잭션)는 흐름으로만 보인다. 상장 심사에서 처음 묻는
 * 것들이기도 하다.
 *
 * 계열은 언제나 하나씩 그린다. 난이도와 블록 간격을 한 그림에 겹치면 축이
 * 두 개가 되고, 축이 두 개면 눈금을 어떻게 놓느냐에 따라 "같이 움직인다"는
 * 없는 이야기를 만들어 낼 수 있다.
 */
const Bar = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: ${space.sm};
  margin-bottom: ${space.lg};
`;

const Spacer = styled.span`
  flex: 1;
  min-width: 0;
`;

/*
 * 고른 것은 **불투명한** 바탕으로 표시한다.
 *
 * 처음에는 위 메뉴처럼 accentSoft(반투명 강조색)를 썼다. 위 메뉴는 흰
 * 헤더 위에 얹혀 4.6:1 이 나오는데, 이 단추는 회색 페이지 배경 위에 있어
 * 같은 값이 4.14:1 로 떨어졌다 — 반투명은 무엇 위에 얹히느냐로 밝기가
 * 달라진다. 바탕을 고정한 accentBadge 와 그 바탕에 맞춰 잡아 둔
 * accentBadgeText 를 쓴다(theme.js).
 */
const Choice = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${tap.mouse};
  padding: 0 ${space.md};
  border: 1px solid ${props => (props.on ? "var(--accent)" : "var(--border)")};
  border-radius: ${radius.sm};
  background: ${props => (props.on ? "var(--accentBadge)" : "var(--surface)")};
  color: ${props => (props.on ? "var(--accentBadgeText)" : "var(--textMuted)")};
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;

  &:hover { border-color: var(--borderStrong); }

  &:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accentSoft);
  }

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
  }
`;

const RANGES = [100, 500, 2000];

/*
 * 막대로 그릴지 선으로 그릴지.
 *
 * 500개를 1000px 안에 막대로 세우면 한 칸이 2px 이라 막대가 아니라 색면이
 * 된다. 점이 많아지면 선이 맞다 — 하나하나의 값보다 흐름을 보는 그림이 되기
 * 때문이다. 경계는 "막대 하나가 최소 6px 은 되어야 막대로 보인다"에서 잡았다.
 */
const COLUMN_LIMIT = 120;

/*
 * 위로 벗어난 값을 어디서 자를지.
 *
 * 노드가 한 번 멈추면 그 블록의 간격만 몇 시간이 되고, 거기에 축을 맞추면
 * 나머지가 전부 바닥에 눌린다. 위에서 2%를 버린 값과 목표의 6배 중 큰 쪽을
 * 쓴다 — 목표의 6배까지는 흔히 있는 일이라 자르면 안 되고, 그보다 위는
 * 몇 개뿐이라 잘라도 그림이 말하는 바가 달라지지 않는다.
 */
const clipAt = (values, floor) => {
  const clean = values.filter(v => typeof v === "number").sort((a, b) => a - b);
  if (clean.length === 0) {
    return null;
  }
  const p98 = clean[Math.min(clean.length - 1, Math.floor(clean.length * 0.98))];
  const top = clean[clean.length - 1];
  const limit = Math.max(floor, p98);
  // 벗어나는 점이 없으면 자르지 않는다 — 괜한 각주를 달지 않기 위해
  return top > limit ? limit : null;
};

class Charts extends Component {
  state = { rows: [], range: 500, error: null, loading: true };

  componentDidMount() {
    setPageMeta(
      "차트",
      "LimCoin 난이도, 블록 간격, 블록당 트랜잭션 수의 최근 흐름."
    );
    this._load(this.state.range);
  }

  componentWillUnmount() {
    this._gone = true;
  }

  _load = async range => {
    this.setState({ loading: true, range });
    try {
      const rows = await getBlockSeries(range);
      if (this._gone) {
        return;
      }
      this.setState({ rows, error: null, loading: false });
    } catch (e) {
      if (this._gone) {
        return;
      }
      this.setState({
        loading: false,
        error: toKorean(e.response ? e.response.data : e.message)
      });
    }
  };

  _csv = () => {
    const { rows } = this.state;
    downloadCsv(
      `limcoin-blocks-${rows.length ? rows[rows.length - 1].height : 0}.csv`,
      ["높이", "시각(UTC)", "난이도", "bits", "블록 간격(초)", "트랜잭션 수"],
      rows.map(r => [
        r.height,
        new Date(r.timestamp * 1000).toISOString(),
        r.difficulty,
        r.bits,
        r.solveTime === null ? "" : r.solveTime,
        r.txCount === null ? "" : r.txCount
      ])
    );
  };

  render() {
    const { rows, range, error, loading } = this.state;
    const { info } = this.props;
    const target = info && info.targetSpacing ? info.targetSpacing : 10;

    if (error) {
      return <Empty>{error}</Empty>;
    }

    const at = pick => rows.map(r => ({ x: r.height, y: pick(r), label: String(r.height) }));
    const dense = rows.length > COLUMN_LIMIT;

    /*
     * 첫 줄의 간격은 null 이다 — 앞 블록이 이 창 밖에 있어 잴 수 없다.
     * 0 으로 채우면 "0초 만에 나왔다"는 거짓말이 되므로 그 점은 비운다.
     */
    return (
      <React.Fragment>
        <SectionTitle>차트</SectionTitle>

        <Bar>
          {RANGES.map(n => (
            <Choice
              key={n}
              type="button"
              on={range === n}
              aria-pressed={range === n}
              onClick={() => this._load(n)}
            >
              최근 {n.toLocaleString()}블록
            </Choice>
          ))}
          <Spacer />
          <Choice type="button" onClick={this._csv} disabled={rows.length === 0}>
            CSV 내려받기
          </Choice>
        </Bar>

        {loading && rows.length === 0 && <Empty>불러오는 중…</Empty>}

        {rows.length > 0 && (
          <React.Fragment>
            <Chart
              title="난이도"
              note="한 블록을 찾는 데 드는 계산량. 블록마다 LWMA 로 다시 잡으므로 위아래로 흔들리는 것이 정상이다."
              data={at(r => r.difficulty)}
              kind="line"
              yLabel="난이도"
              format={formatDifficulty}
            />

            <Chart
              title="블록 간격"
              note={`앞 블록과의 시간 차. 점선이 목표(${target}초)다 — 위로 벗어나면 느리게, 아래면 빠르게 나온 블록이다.`}
              data={at(r => r.solveTime)}
              kind="line"
              unit="초"
              yLabel="간격"
              zeroBased
              integer
              clipTo={clipAt(rows.map(r => r.solveTime), target * 6)}
              baseline={{ value: target, label: `목표 ${target}초` }}
              format={v => `${v.toLocaleString()}초`}
            />

            <Chart
              title="블록당 트랜잭션 수"
              note="코인베이스(채굴 보상)를 포함한다. 아무도 안 쓰는 체인은 계속 1이다."
              data={at(r => r.txCount)}
              kind={dense ? "line" : "column"}
              unit="건"
              yLabel="트랜잭션"
              zeroBased
              integer
              format={v => `${v}건`}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

Charts.propTypes = {
  info: PropTypes.object
};

export default Charts;
