import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { radius, space, mono, breakpoint, tap } from "../../theme";
import { niceScale, shortNumber, roundedTopBar } from "./scale";

/*
 * 한 계열짜리 차트.
 *
 * 라이브러리를 붙이지 않고 SVG 를 직접 그린다. 이유는 두 가지다 —
 * 계열이 하나뿐이라 라이브러리가 해 주는 일(범례, 색 배정, 축 여러 개)이
 * 애초에 필요 없고, 익스플로러 번들에 그림 그리는 코드 200KB 를 얹으면
 * 첫 화면이 느려진다. 실제로 필요한 것은 축·선·막대·마우스 따라다니는
 * 값 표시뿐이다.
 *
 * 지키는 규칙:
 *   - 계열이 하나면 범례를 두지 않는다. 제목이 곧 계열 이름이다.
 *   - 막대는 0 에서 시작한다. 선은 그러지 않아도 된다(변화를 보는 그림이라).
 *   - 축·격자는 뒤로 물러나 있고 데이터가 앞에 온다.
 *   - 색만으로 뜻을 전하지 않는다 — 값은 글자로도 읽을 수 있어야 해서
 *     "표로 보기"를 함께 둔다.
 */
const Wrap = styled.section`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: ${radius.md};
  box-shadow: var(--shadow);
  margin-bottom: ${space.lg};
  overflow: hidden;
`;

const Head = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: ${space.md};
  padding: ${space.lg} ${space.lg} ${space.sm};

  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.md} ${space.md} ${space.sm};
  }
`;

const Titles = styled.div`
  min-width: 0;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
`;

const Note = styled.p`
  margin: ${space.xs} 0 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--textMuted);
`;

const Toggle = styled.button`
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: ${tap.mouse};
  padding: 0 ${space.md};
  border: 1px solid var(--border);
  border-radius: ${radius.sm};
  background: var(--surface);
  color: var(--textMuted);
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;

  &:hover { border-color: var(--borderStrong); color: var(--text); }

  &:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accentSoft);
  }

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
  }
`;

const Plot = styled.div`
  position: relative;
  padding: 0 ${space.sm} ${space.sm};

  /* 키보드로 들어왔을 때 어디에 있는지 보이게 */
  & > svg:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px var(--accentSoft);
    border-radius: ${radius.sm};
  }
`;

const Tip = styled.div`
  position: absolute;
  z-index: 2;
  pointer-events: none;
  transform: translateX(-50%);
  padding: ${space.sm} ${space.md};
  background: var(--surfaceRaised);
  border: 1px solid var(--borderStrong);
  border-radius: ${radius.sm};
  box-shadow: var(--shadow);
  white-space: nowrap;
  font-size: 12px;
  line-height: 1.5;
`;

const TipKey = styled.span`
  color: var(--textMuted);
`;

const TipValue = styled.strong`
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12.5px;

  th, td {
    padding: ${space.sm} ${space.lg};
    text-align: right;
    border-bottom: 1px solid var(--border);
    font-variant-numeric: tabular-nums;
  }

  th {
    position: sticky;
    top: 0;
    background: var(--surfaceSunken);
    color: var(--textMuted);
    font-weight: 600;
  }

  td:first-child, th:first-child {
    text-align: left;
    font-family: ${mono};
  }
`;

const Scroll = styled.div`
  max-height: 320px;
  overflow: auto;
  border-top: 1px solid var(--border);
`;

const Empty = styled.p`
  margin: 0;
  padding: ${space.xl} ${space.lg};
  text-align: center;
  color: var(--textMuted);
`;

// 그림 아래 각주 — 잘라 낸 값이 있으면 반드시 여기 적는다
const Foot = styled.p`
  margin: 0;
  padding: 0 ${space.lg} ${space.md};
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--textMuted);

  @media (max-width: ${breakpoint.sm}) {
    padding: 0 ${space.md} ${space.md};
  }
`;

const HEIGHT = 200;
const PAD = { top: 12, right: 12, bottom: 24, left: 52 };

/*
 * 글자 폭 어림.
 *
 * SVG 안의 글자 뒤에 바탕을 깔려면 폭을 알아야 하는데, 그리기 전에는 잴 수
 * 없다. 한글은 글자 크기만큼, 영문·숫자는 그 절반 남짓 차지한다는 어림으로
 * 충분하다 — 바탕이 몇 픽셀 넓거나 좁아도 읽는 데 지장이 없다.
 */
const textWidth = (text, size) =>
  text
    .split("")
    .reduce((sum, ch) => sum + (/[\uAC00-\uD7A3\u3131-\u318E]/.test(ch) ? size : size * 0.56), 0);

class Chart extends Component {
  state = { width: 0, hover: -1, table: false };

  componentDidMount() {
    this._measure();
    window.addEventListener("resize", this._measure);
  }

  componentDidUpdate() {
    /*
     * 그림이 화면에 없다가 나타나는 경우가 있다 — "표로 보기"에서 돌아올 때,
     * 데이터가 늦게 와서 처음엔 빈 상태로 그려질 때. 그때 폭을 재지 않으면
     * 0 인 채로 남아 그림이 접힌다.
     */
    if (this.state.width === 0) {
      this._measure();
    }
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this._measure);
  }

  /*
   * viewBox 로 늘리지 않고 실제 픽셀 너비를 재서 그린다. viewBox 를 늘리면
   * 글자까지 같이 늘어나 좁은 화면에서 축 숫자가 뭉개진다.
   */
  _measure = () => {
    if (this._box) {
      const width = Math.max(240, Math.floor(this._box.getBoundingClientRect().width));
      if (width !== this.state.width) {
        this.setState({ width });
      }
    }
  };

  _at = event => {
    const { data } = this.props;
    const { width } = this.state;
    const svg = this._svg;
    if (!svg || data.length === 0) {
      return;
    }
    const rect = svg.getBoundingClientRect();
    const point = event.touches && event.touches.length ? event.touches[0] : event;
    const x = point.clientX - rect.left;
    const inner = width - PAD.left - PAD.right;
    const ratio = (x - PAD.left) / Math.max(1, inner);
    const index = Math.round(ratio * (data.length - 1));
    const clamped = Math.max(0, Math.min(data.length - 1, index));
    if (clamped !== this.state.hover) {
      this.setState({ hover: clamped });
    }
  };

  _leave = () => this.setState({ hover: -1 });

  // 키보드로도 값을 하나씩 짚을 수 있어야 한다 — 마우스 전용이면 반쪽이다
  _key = event => {
    const { data } = this.props;
    const { hover } = this.state;
    const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (step !== 0) {
      event.preventDefault();
      const from = hover < 0 ? (step > 0 ? -1 : data.length) : hover;
      this.setState({ hover: Math.max(0, Math.min(data.length - 1, from + step)) });
    } else if (event.key === "Home") {
      event.preventDefault();
      this.setState({ hover: 0 });
    } else if (event.key === "End") {
      event.preventDefault();
      this.setState({ hover: data.length - 1 });
    } else if (event.key === "Escape") {
      this.setState({ hover: -1 });
    }
  };

  render() {
    const {
      title, note, data, kind, unit, format, xLabel, yLabel, baseline, zeroBased,
      clipTo, integer
    } = this.props;
    const { width, hover, table } = this.state;

    /*
     * 축 위로 벗어나는 값 자르기.
     *
     * 노드가 몇 시간 멈춰 있었다면 그 한 블록의 간격이 17,000초쯤 된다.
     * 그 값에 축을 맞추면 나머지 499개가 바닥에 눌려 아무것도 안 보인다.
     * 잘라 내되 **없던 일로 하지는 않는다** — 잘린 점은 맨 위에 표시하고,
     * 몇 개가 얼마나 벗어났는지 그림 아래에 적는다. 표로 보기에는 언제나
     * 실제 값이 그대로 있다.
     */
    const overflow = clipTo
      ? data.filter(d => typeof d.y === "number" && d.y > clipTo)
      : [];
    const yOfPoint = d =>
      typeof d.y !== "number" ? null : clipTo && d.y > clipTo ? clipTo : d.y;

    const values = data.map(yOfPoint);
    const withBaseline = baseline ? values.concat([baseline.value]) : values;
    const scale = niceScale(withBaseline, 4, zeroBased, integer);

    const inner = Math.max(1, width - PAD.left - PAD.right);
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    const span = scale.max - scale.min || 1;

    const xOf = i =>
      data.length <= 1 ? PAD.left + inner / 2 : PAD.left + (inner * i) / (data.length - 1);
    const yOf = v => PAD.top + plotH - ((v - scale.min) / span) * plotH;

    const points = data
      .map((d, i) => {
        const v = yOfPoint(d);
        return v === null ? null : `${xOf(i).toFixed(1)},${yOf(v).toFixed(1)}`;
      })
      .filter(Boolean);

    // x 축 글자는 대여섯 개만. 다 적으면 서로 겹쳐 읽을 수 없다.
    const xTickEvery = Math.max(1, Math.ceil(data.length / Math.max(2, Math.floor(inner / 90))));

    const active = hover >= 0 && hover < data.length ? data[hover] : null;
    const tipLeft = active ? Math.max(64, Math.min(width - 64, xOf(hover))) : 0;

    const band = data.length > 0 ? inner / data.length : inner;
    const barWidth = Math.max(1, Math.min(24, band - 2));

    return (
      <Wrap>
        <Head>
          <Titles>
            <Title>{title}</Title>
            {note && <Note>{note}</Note>}
          </Titles>
          <Toggle
            type="button"
            onClick={() => this.setState({ table: !table })}
            aria-pressed={table}
          >
            {table ? "그림으로" : "표로 보기"}
          </Toggle>
        </Head>

        {data.length === 0 && <Empty>아직 보여 줄 블록이 없습니다.</Empty>}

        {data.length > 0 && table && (
          <Scroll>
            <Table>
              <thead>
                <tr>
                  <th scope="col">{xLabel}</th>
                  <th scope="col">
                    {yLabel}
                    {unit ? ` (${unit})` : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* 최근 것이 위로 오게 뒤집는다 — 표는 위에서부터 읽는다 */}
                {data
                  .slice()
                  .reverse()
                  .map(d => (
                    <tr key={d.x}>
                      <td>{d.label || d.x}</td>
                      <td>{typeof d.y === "number" ? format(d.y) : "—"}</td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Scroll>
        )}

        {data.length > 0 &&
          !table && (
            <Plot innerRef={el => (this._box = el)}>
              {active && (
                <Tip style={{ left: `${tipLeft}px`, top: "4px" }}>
                  <TipKey>
                    {xLabel} {active.label || active.x}
                  </TipKey>
                  <br />
                  <TipValue>
                    {typeof active.y === "number" ? format(active.y) : "알 수 없음"}
                  </TipValue>
                  {unit && typeof active.y === "number" && <TipKey> {unit}</TipKey>}
                  {clipTo && typeof active.y === "number" && active.y > clipTo && (
                    <TipKey> (축 위로 벗어남)</TipKey>
                  )}
                </Tip>
              )}
              <svg
                width={width || 300}
                height={HEIGHT}
                role="img"
                tabIndex="0"
                aria-label={`${title}. 값은 "표로 보기" 단추로 숫자로 읽을 수 있습니다.`}
                ref={el => (this._svg = el)}
                onMouseMove={this._at}
                onMouseLeave={this._leave}
                onTouchStart={this._at}
                onTouchMove={this._at}
                onTouchEnd={this._leave}
                onKeyDown={this._key}
                onBlur={this._leave}
                style={{ display: "block", touchAction: "pan-y" }}
              >
                {/* 격자 — 값을 어림하는 보조선이라 눈에 띄면 안 된다 */}
                {scale.ticks.map(t => (
                  <g key={t}>
                    <line
                      x1={PAD.left}
                      x2={width - PAD.right}
                      y1={yOf(t)}
                      y2={yOf(t)}
                      stroke="var(--border)"
                      strokeWidth="1"
                    />
                    <text
                      x={PAD.left - 8}
                      y={yOf(t) + 4}
                      textAnchor="end"
                      fontSize="11"
                      fill="var(--textMuted)"
                    >
                      {shortNumber(t)}
                    </text>
                  </g>
                ))}

                {/* 기준선(목표 블록 간격 등). 데이터가 아니므로 점선으로 구분한다. */}
                {baseline && (
                  <g>
                    <line
                      x1={PAD.left}
                      x2={width - PAD.right}
                      y1={yOf(baseline.value)}
                      y2={yOf(baseline.value)}
                      stroke="var(--textFaint)"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    {/*
                      글자 뒤에 바탕을 깐다. 데이터가 촘촘한 그림에서는 이게
                      없으면 선들 위에 글자가 겹쳐 아무것도 읽히지 않는다.
                    */}
                    <rect
                      x={width - PAD.right - textWidth(baseline.label, 11) - 6}
                      y={Math.max(PAD.top, yOf(baseline.value) - 16)}
                      width={textWidth(baseline.label, 11) + 6}
                      height={14}
                      rx="2"
                      fill="var(--surface)"
                    />
                    <text
                      x={width - PAD.right - 3}
                      y={Math.max(PAD.top, yOf(baseline.value) - 16) + 11}
                      textAnchor="end"
                      fontSize="11"
                      fill="var(--textMuted)"
                    >
                      {baseline.label}
                    </text>
                  </g>
                )}

                {kind === "column" &&
                  data.map((d, i) => {
                    const v = yOfPoint(d);
                    if (v === null) {
                      return null;
                    }
                    const y = yOf(v);
                    const zero = yOf(Math.max(scale.min, 0));
                    const h = Math.max(v > 0 ? 2 : 0, zero - y);
                    return (
                      <path
                        key={d.x}
                        d={roundedTopBar(xOf(i) - barWidth / 2, zero - h, barWidth, h, 4)}
                        fill="var(--accent)"
                        opacity={hover < 0 || hover === i ? 1 : 0.45}
                      />
                    );
                  })}

                {/*
                  선만 긋고 아래를 채우지 않는다. 채워 놓으면 값이 늘 같은
                  계열(블록당 1건)이 화면을 가득 메운 색덩어리가 되고,
                  0 에서 시작하지 않는 축에서는 "이만큼 있다"로 잘못 읽힌다.
                */}
                {kind === "line" &&
                  points.length > 0 && (
                    <polyline
                      points={points.join(" ")}
                      fill="none"
                      stroke="var(--accent)"
                      strokeWidth="2"
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  )}

                {/* 축 위로 벗어난 점 — 맨 위에 작은 삼각형으로 남긴다 */}
                {overflow.length > 0 &&
                  data.map(
                    (d, i) =>
                      typeof d.y === "number" && d.y > clipTo ? (
                        <path
                          key={`over-${d.x}`}
                          d={`M${xOf(i) - 4},${PAD.top + 1} L${xOf(i) + 4},${PAD.top +
                            1} L${xOf(i)},${PAD.top - 5} Z`}
                          fill="var(--accent)"
                        />
                      ) : null
                  )}

                {/* x 축 눈금 */}
                {data.map(
                  (d, i) =>
                    i % xTickEvery === 0 || i === data.length - 1 ? (
                      <text
                        key={d.x}
                        x={xOf(i)}
                        y={HEIGHT - 6}
                        textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}
                        fontSize="11"
                        fill="var(--textMuted)"
                      >
                        {d.label || d.x}
                      </text>
                    ) : null
                )}

                {/* 짚고 있는 자리 — 세로 실선과 점 하나 */}
                {active && (
                  <g>
                    <line
                      x1={xOf(hover)}
                      x2={xOf(hover)}
                      y1={PAD.top}
                      y2={PAD.top + plotH}
                      stroke="var(--borderStrong)"
                      strokeWidth="1"
                    />
                    {typeof active.y === "number" && (
                      /* 테두리는 배경색 2px — 선 위에 겹쳐도 점이 묻히지 않는다 */
                      <circle
                        cx={xOf(hover)}
                        cy={yOf(active.y)}
                        r="5"
                        fill="var(--accent)"
                        stroke="var(--surface)"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                )}
              </svg>
            </Plot>
          )}

        {data.length > 0 &&
          !table &&
          overflow.length > 0 && (
            <Foot>
              {/* format 이 단위까지 붙여 주므로 여기서 또 붙이지 않는다 */}
              ▲ 로 표시한 {overflow.length}개 점은 축({format(clipTo)})을 넘어
              잘렸습니다. 가장 큰 값은{" "}
              {format(Math.max.apply(null, overflow.map(d => d.y)))} 입니다 — 실제 값은
              “표로 보기”에 그대로 있습니다.
            </Foot>
          )}
      </Wrap>
    );
  }
}

Chart.propTypes = {
  title: PropTypes.string.isRequired,
  note: PropTypes.string,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number,
      label: PropTypes.string
    })
  ).isRequired,
  kind: PropTypes.oneOf(["line", "column"]),
  unit: PropTypes.string,
  format: PropTypes.func,
  xLabel: PropTypes.string,
  yLabel: PropTypes.string,
  baseline: PropTypes.shape({ value: PropTypes.number, label: PropTypes.string }),
  zeroBased: PropTypes.bool,
  // 이 값을 넘는 점은 축 위로 잘라 낸다 (표시는 남긴다)
  clipTo: PropTypes.number,
  // 세는 값이라 눈금이 정수여야 하는가
  integer: PropTypes.bool
};

Chart.defaultProps = {
  kind: "line",
  format: shortNumber,
  xLabel: "높이",
  yLabel: "값",
  zeroBased: false,
  integer: false
};

export default Chart;
