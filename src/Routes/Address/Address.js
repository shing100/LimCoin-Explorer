import React, { Component, Fragment } from "react";
import ScriptDecoder from "Components/ScriptDecoder";
import QrCode from "Components/QrCode";
import CopyButton from "Components/CopyButton";
import { addressKind } from "../../utils";
import { toKorean } from "../../errors";
import { setPageMeta, shorten } from "../../meta";
import styled from "styled-components";
import { getBalance, getAddressTransactions, getAddressUtxos } from "../../api";
import { formatLim } from "../../units";
import { breakpoint, space, radius, mono, tap } from "../../theme";
import { downloadCsv } from "../../csv";
import {
  Card, SectionTitle, SectionNote, Back, Empty,
  HeadRow, BodyRow, Cell, Hash, Num, Time, MonoLink, Pager, PagerButton
} from "Components/Shared";

const PAGE_SIZE = 25;

// 주소 내역은 "받음 / 보냄"이 둘 다 있을 수 있어 열이 다르다
const Row = styled.div`
  display: grid;
  align-items: center;
  gap: 16px;
  padding: 12px 18px;
  grid-template-columns: 70px minmax(0, 1fr) 110px 110px 170px;

  @media (max-width: ${breakpoint.md}) {
    grid-template-columns: 60px minmax(0, 1fr) 100px 100px;
  }
  @media (max-width: ${breakpoint.sm}) {
    grid-template-columns: 52px minmax(0, 1fr) 96px;
  }
`;

const Head = HeadRow.extend`
  grid-template-columns: 70px minmax(0, 1fr) 110px 110px 170px;

  @media (max-width: ${breakpoint.md}) {
    grid-template-columns: 60px minmax(0, 1fr) 100px 100px;
  }
  @media (max-width: ${breakpoint.sm}) {
    grid-template-columns: 52px minmax(0, 1fr) 96px;
  }
`;

const Body = BodyRow.withComponent(Row);

/*
 * 받은 값과 보낸 값.
 *
 * 예전에는 `var(--positive, #1a7f37)` 이었다. 그런데 테마에 positive/negative
 * 가 아예 없어서 **폴백만 쓰였다** — 라이트용 진한 초록·빨강이 다크 화면에도
 * 그대로 나와 3.4:1 밖에 안 됐다. 토큰을 테마에 넣고 폴백을 지운다.
 */
const In = styled(Num)`
  color: var(--positive);
`;

const Out = styled(Num)`
  color: var(--negative);
`;

/*
 * "이쪽으로는 오간 게 없다"를 뜻하는 자리표시.
 *
 * 예전에는 In/Out 을 그대로 써서 빈 칸의 em 대시가 초록·빨강으로 칠해졌다.
 * 아무 일도 없었다는 표시가 "보냄"으로 읽히면 안 된다. 값이 있을 때만 색을 쓴다.
 */
const None = styled(Num)`
  color: var(--textFaint);
`;

const Block = styled(Cell)`
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--accent);
`;

/*
 * 주소 카드 = 왼쪽에 값들, 오른쪽에 QR.
 *
 * 좁아지면 QR 이 위로 올라가고 값이 아래로 간다. QR 을 아래에 두면 휴대폰
 * 에서 스크롤을 내려야 나오는데, 휴대폰이야말로 QR 을 찍는 화면이다.
 */
const Identity = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${space.lg};
  padding: ${space.lg};

  @media (max-width: ${breakpoint.sm}) {
    flex-direction: column-reverse;
    align-items: center;
    padding: ${space.md};
  }
`;

const Facts = styled.div`
  flex: 1;
  min-width: 0;
`;

const AddressLine = styled.div`
  display: flex;
  align-items: center;
  gap: ${space.sm};
  flex-wrap: wrap;
  margin-bottom: ${space.md};
`;

const AddressText = styled.span`
  min-width: 0;
  font-family: ${mono};
  font-size: 13px;
  overflow-wrap: anywhere;
`;

const Label = styled.p`
  margin: 0 0 ${space.xs};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--textMuted);
`;

const Balance = styled.p`
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const BalanceUnit = styled.span`
  margin-left: 5px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
`;

const Sub = styled.p`
  margin: ${space.xs} 0 0;
  font-size: 12.5px;
  color: var(--textMuted);
`;

const QrNote = styled.p`
  margin: ${space.xs} 0 0;
  font-size: 11px;
  text-align: center;
  color: var(--textFaint);
`;

const QrSide = styled.div`
  flex: none;
`;

const Tools = styled.div`
  display: flex;
  align-items: center;
  gap: ${space.sm};
  /* 제목은 baseline 정렬이라 단추가 글자 아랫선에 걸린다 — 따로 가운데로 */
  align-self: center;
  margin-left: auto;
`;

const ToolButton = styled.button`
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

class Address extends Component {
  state = {
    balance: null,
    utxoCount: null,
    transactions: [],
    total: 0,
    page: 0,
    error: null,
    loading: true,
    csvBusy: false,
    csvNote: null
  };

  componentDidMount() {
    this._load(0);
  }

  componentDidUpdate(prev) {
    if (prev.match.params.address !== this.props.match.params.address) {
      this._load(0);
    }
  }

  _load = async page => {
    const { address } = this.props.match.params;
    this.setState({ loading: true, error: null });
    try {
      const [{ balance }, history, utxos] = await Promise.all([
        getBalance(address),
        getAddressTransactions(address, PAGE_SIZE, page * PAGE_SIZE),
        getAddressUtxos(address)
      ]);
      this.setState({
        balance,
        utxoCount: utxos.length,
        transactions: history.transactions,
        total: history.total,
        page,
        loading: false
      });
      setPageMeta(
        `주소 ${shorten(address, 6, 6)}`,
        `잔액 ${formatLim(balance)} LIM, 트랜잭션 ${history.total}건, 미사용 출력 ${utxos.length}개`
      );
    } catch (e) {
      this.setState({
        loading: false,
        error: toKorean(e.response ? e.response.data : e.message)
      });
    }
  };

  componentWillUnmount() {
    this._gone = true;
  }

  /*
   * 내역 전체를 CSV 로.
   *
   * 화면은 25건씩 보여 주지만 파일은 전부 담아야 쓸모가 있다 — 세금 정리를
   * 하는 사람이 페이지를 넘겨 가며 40번 내려받게 할 수는 없다. 노드에
   * 200건씩 나눠 묻는다(한 번에 다 달라고 하면 노드 쪽 메모리가 튄다).
   */
  _csv = async () => {
    const { address } = this.props.match.params;
    const { total } = this.state;
    const CHUNK = 200;
    const MAX = 20000;

    this.setState({ csvBusy: true, csvNote: null });
    try {
      const rows = [];
      const cap = Math.min(total, MAX);
      for (let offset = 0; offset < cap; offset += CHUNK) {
        const page = await getAddressTransactions(address, CHUNK, offset);
        if (page.transactions.length === 0) {
          break;
        }
        page.transactions.forEach(tx => rows.push(tx));
      }
      if (this._gone) {
        return;
      }

      downloadCsv(
        `limcoin-${address}.csv`,
        [
          "블록", "시각(UTC)", "트랜잭션 ID",
          "받음(LIM)", "보냄(LIM)", "순변동(LIM)",
          "받음(lm)", "보냄(lm)"
        ],
        rows.map(tx => [
          tx.blockIndex,
          new Date(tx.timestamp * 1000).toISOString(),
          tx.txId,
          formatLim(tx.received),
          formatLim(tx.spent),
          formatLim(tx.received - tx.spent),
          tx.received,
          tx.spent
        ])
      );

      this.setState({
        csvBusy: false,
        csvNote:
          total > MAX
            ? `내역이 ${total.toLocaleString()}건이라 최근 ${MAX.toLocaleString()}건까지만 담았습니다.`
            : null
      });
    } catch (e) {
      if (!this._gone) {
        this.setState({
          csvBusy: false,
          csvNote: toKorean(e.response ? e.response.data : e.message)
        });
      }
    }
  };

  render() {
    const {
      balance, utxoCount, transactions, total, page, error, loading,
      csvBusy, csvNote
    } = this.state;
    const { address } = this.props.match.params;
    const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);
    const kind = addressKind(address);

    if (loading) {
      return <Empty>불러오는 중…</Empty>;
    }
    if (error) {
      return (
        <Fragment>
          <Back to="/">← 홈</Back>
          <Card><Empty>{error}</Empty></Card>
        </Fragment>
      );
    }

    return (
      <Fragment>
        <Back to="/">← 홈</Back>
        <SectionTitle>주소</SectionTitle>
        <Card>
          <Identity>
            <Facts>
              <Label>주소</Label>
              <AddressLine>
                <AddressText>{address}</AddressText>
                <CopyButton value={address} label="복사" />
              </AddressLine>
              <Label>잔액</Label>
              <Balance>
                {formatLim(balance)}
                <BalanceUnit>LIM</BalanceUnit>
              </Balance>
              <Sub>
                미사용 출력 {utxoCount}개 · 트랜잭션 {total.toLocaleString()}건
                {kind ? ` · ${kind.label} 주소` : ""}
              </Sub>
            </Facts>
            <QrSide>
              <QrCode value={address} title={`주소 ${address} 의 QR 코드`} />
              <QrNote>휴대폰으로 찍어 옮기기</QrNote>
            </QrSide>
          </Identity>
        </Card>

        {/* 조건으로 잠긴 주소(M…/2…)면 그 조건을 풀어 볼 수 있게 한다 */}
        {kind && kind.label === "스크립트" && <ScriptDecoder address={address} />}

        <SectionTitle style={{ marginTop: 30 }}>
          트랜잭션
          <SectionNote>전체 {total.toLocaleString()}건</SectionNote>
          <Tools>
            <ToolButton type="button" onClick={this._csv} disabled={csvBusy || total === 0}>
              {csvBusy ? "모으는 중…" : "CSV 내려받기"}
            </ToolButton>
          </Tools>
        </SectionTitle>
        {csvNote && <Sub>{csvNote}</Sub>}
        <Card>
          <Head>
            <Cell>블록</Cell>
            <Cell>트랜잭션 ID</Cell>
            <Cell>받음</Cell>
            <Cell hideBelow="sm">보냄</Cell>
            <Cell hideBelow="md">시각</Cell>
          </Head>
          {transactions.length === 0 ? (
            <Empty>이 주소가 얽힌 트랜잭션이 없습니다.</Empty>
          ) : (
            transactions.map(tx => (
              <Body key={`${tx.txId}-${tx.blockIndex}`}>
                <Block>{tx.blockIndex}</Block>
                <Hash title={tx.txId}>
                  <MonoLink to={`/tx/${tx.txId}`}>{tx.txId}</MonoLink>
                </Hash>
                {tx.received > 0 ? (
                  <In>{`+${formatLim(tx.received)}`}</In>
                ) : (
                  <None>—</None>
                )}
                {tx.spent > 0 ? (
                  <Out hideBelow="sm">{`−${formatLim(tx.spent)}`}</Out>
                ) : (
                  <None hideBelow="sm">—</None>
                )}
                <Time hideBelow="md" seconds={tx.timestamp} />
              </Body>
            ))
          )}
        </Card>
        {lastPage > 0 && (
          <Pager>
            <PagerButton onClick={() => this._load(page - 1)} disabled={page === 0}>
              ← 최신
            </PagerButton>
            <span>
              {page + 1} / {lastPage + 1}
            </span>
            <PagerButton
              onClick={() => this._load(page + 1)}
              disabled={page >= lastPage}
            >
              이전 →
            </PagerButton>
          </Pager>
        )}
      </Fragment>
    );
  }
}

export default Address;
