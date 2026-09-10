import React, { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Card, SectionTitle, SectionNote, Empty } from "Components/Shared";
import { getRichList } from "../../api";
import { setPageMeta } from "../../meta";
import { toKorean } from "../../errors";
import { formatLim } from "../../units";
import { downloadCsv } from "../../csv";
import { radius, space, mono, breakpoint, tap } from "../../theme";

/*
 * 부자 목록 (rich list).
 *
 * 무엇을 보여 주는가: 지금 UTXO 집합을 주소별로 합친 잔액 순위. 노드가 이미
 * 주소별 UTXO 색인을 갖고 있으므로 새로 세는 것이 아니라 모아서 정렬만 한다.
 *
 * 무엇을 **보여 주지 않는가**: 사람 순위. 한 사람이 주소를 수십 개 쓰기도
 * 하고, 거래소 주소 하나에 수만 명의 돈이 섞여 있기도 하다. 이 구분을
 * 화면에 적어 두지 않으면 "1위가 발행량의 94%를 갖고 있다"는 식의 오해가
 * 그대로 퍼진다 — 지금 우리 체인처럼 채굴자가 혼자 도는 동안은 특히.
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

const Button = styled.button`
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
  &:disabled { opacity: .5; cursor: default; }

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
  }
`;

const Head = styled.div`
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 150px 120px;
  gap: ${space.md};
  padding: ${space.sm} ${space.lg};
  background: var(--surfaceSunken);
  border-bottom: 1px solid var(--border);
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--textMuted);

  & > :nth-child(3), & > :nth-child(4) { text-align: right; }

  @media (max-width: ${breakpoint.md}) {
    grid-template-columns: 40px minmax(0, 1fr) 120px;
    & > :nth-child(4) { display: none; }
  }

  /*
   * 휴대폰에서는 잔액을 주소 아래 줄로 내린다.
   *
   * 한 줄에 다 넣으려면 "5,630.00105012 LIM" 에 150px 이 필요한데, 390px
   * 화면에서 그만큼 떼어 주면 주소가 열 글자밖에 안 남는다. 실제로 그렇게
   * 해 봤더니 1위 줄의 잔액이 카드 밖으로 삐져나갔다.
   */
  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.sm} ${space.md};
    grid-template-columns: 28px minmax(0, 1fr);
    & > :nth-child(3) { display: none; }
  }
`;

/*
 * 줄 전체가 주소 페이지로 가는 링크다. 예전에 다른 표에서 배운 것 —
 * 주소 글자만 링크로 두면 손가락으로는 잘 안 맞는다.
 */
const Row = styled(Link)`
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 150px 120px;
  gap: ${space.md};
  align-items: center;
  padding: ${space.md} ${space.lg};
  min-height: ${tap.mouse};
  border-bottom: 1px solid var(--border);
  color: inherit;

  &:last-child { border-bottom: none; }
  &:hover { background: var(--surfaceSunken); }
  &:focus-visible {
    outline: none;
    box-shadow: inset 0 0 0 2px var(--accent);
  }

  @media (max-width: ${breakpoint.md}) {
    grid-template-columns: 40px minmax(0, 1fr) 120px;
    & > :nth-child(4) { display: none; }
  }

  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.md};
    min-height: ${tap.touch};
    grid-template-columns: 28px minmax(0, 1fr);
    /* 잔액은 주소 아래 줄로 (제목 줄에서도 같이 감춘다) */
    & > :nth-child(3) {
      grid-column: 2;
      text-align: left;
      margin-top: ${space.xs};
    }
  }
`;

const Rank = styled.span`
  font-size: 13px;
  font-weight: 700;
  color: var(--textMuted);
  font-variant-numeric: tabular-nums;
`;

const Addr = styled.span`
  min-width: 0;
  font-family: ${mono};
  font-size: 12.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Amount = styled.span`
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
`;

const Unit = styled.span`
  margin-left: 3px;
  font-size: 11px;
  font-weight: 600;
  color: var(--textMuted);
`;

/*
 * 비중은 숫자와 막대를 함께 둔다.
 *
 * 막대만 두면 "3.2% 와 2.9% 중 어느 쪽이 큰가"를 눈으로 재야 하고, 숫자만
 * 두면 1위가 나머지를 얼마나 압도하는지가 안 보인다. 막대는 값을 읽는
 * 수단이 아니라 크기 차이를 한눈에 주는 배경이다.
 */
const Share = styled.span`
  position: relative;
  text-align: right;
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
  color: var(--textMuted);
`;

const ShareBar = styled.span`
  display: block;
  height: 4px;
  margin-top: 3px;
  border-radius: 2px;
  background: var(--surfaceSunken);
  overflow: hidden;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${props => Math.max(2, Math.min(100, props.percent))}%;
    background: var(--accent);
    border-radius: 2px;
  }
`;

const Note = styled.p`
  margin: ${space.md} 0 0;
  font-size: 12.5px;
  line-height: 1.7;
  color: var(--textMuted);
`;

const LIMIT = 100;

class RichList extends Component {
  state = { data: null, error: null, loading: true };

  componentDidMount() {
    setPageMeta(
      "부자 목록",
      "LimCoin 잔액이 많은 주소 순위. 주소 순위이지 사람 순위가 아닙니다."
    );
    this._load();
  }

  componentWillUnmount() {
    this._gone = true;
  }

  _load = async () => {
    try {
      const data = await getRichList(LIMIT);
      if (!this._gone) {
        this.setState({ data, error: null, loading: false });
      }
    } catch (e) {
      if (!this._gone) {
        this.setState({
          loading: false,
          error: toKorean(e.response ? e.response.data : e.message)
        });
      }
    }
  };

  _csv = () => {
    const { data } = this.state;
    downloadCsv(
      `limcoin-richlist-${data.height}.csv`,
      ["순위", "주소", "잔액(LIM)", "잔액(lm)", "UTXO 개수", "발행량 대비(%)"],
      data.rows.map((row, i) => [
        i + 1,
        row.address,
        formatLim(row.balance),
        row.balance,
        row.outputs,
        ((row.balance / data.supply) * 100).toFixed(4)
      ])
    );
  };

  render() {
    const { data, error, loading } = this.state;

    if (loading) {
      return <Empty>불러오는 중…</Empty>;
    }
    if (error) {
      return <Empty>{error}</Empty>;
    }

    const rows = data.rows;
    const top = rows.length > 0 ? rows[0].balance : 1;
    const shown = rows.reduce((sum, row) => sum + row.balance, 0);

    return (
      <React.Fragment>
        <SectionTitle>
          부자 목록
          <SectionNote>
            잔액이 있는 주소 {data.addresses.toLocaleString()}개 중 상위 {rows.length}개
          </SectionNote>
        </SectionTitle>

        <Bar>
          <Button type="button" onClick={this._csv} disabled={rows.length === 0}>
            CSV 내려받기
          </Button>
          <Spacer />
        </Bar>

        <Card>
          <Head>
            <span>#</span>
            <span>주소</span>
            <span>잔액</span>
            <span>발행량 대비</span>
          </Head>
          {rows.length === 0 && <Empty>아직 잔액이 있는 주소가 없습니다.</Empty>}
          {rows.map((row, i) => (
            <Row key={row.address} to={`/address/${row.address}`}>
              <Rank>{i + 1}</Rank>
              <Addr title={row.address}>{row.address}</Addr>
              <Amount>
                {formatLim(row.balance)}
                <Unit>LIM</Unit>
              </Amount>
              <Share>
                {((row.balance / data.supply) * 100).toFixed(2)}%
                {/* 막대 길이는 1위 대비 — 발행량 대비로 그리면 다들 너무 짧아 보인다 */}
                <ShareBar percent={(row.balance / top) * 100} />
              </Share>
            </Row>
          ))}
        </Card>

        <Note>
          {data.note}
          <br />
          지금 보이는 {rows.length}개 주소가 발행량 {formatLim(data.supply)} LIM 중{" "}
          {((shown / data.supply) * 100).toFixed(2)}% 를 갖고 있습니다. 높이{" "}
          {data.height.toLocaleString()} 기준이며, 아직 쓰이지 않은 출력(UTXO)만 셉니다 —
          거래소에 맡겨 둔 코인은 그 거래소 주소에 잡힙니다.
        </Note>
      </React.Fragment>
    );
  }
}

export default RichList;
