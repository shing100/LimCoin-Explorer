import React, { Component, Fragment } from "react";
import styled from "styled-components";
import { getBalance, getAddressTransactions, getAddressUtxos } from "../../api";
import { formatLim } from "../../units";
import { makeDate } from "../../utils";
import { breakpoint } from "../../theme";
import {
  Card, SectionTitle, SectionNote, Detail, DKey, DValue, Back, Empty,
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

const In = styled(Num)`
  color: var(--positive, #1a7f37);
`;

const Out = styled(Num)`
  color: var(--negative, #cf222e);
`;

const Block = styled(Cell)`
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  color: var(--accent);
`;

class Address extends Component {
  state = {
    balance: null,
    utxoCount: null,
    transactions: [],
    total: 0,
    page: 0,
    error: null,
    loading: true
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
    } catch (e) {
      this.setState({
        loading: false,
        error: e.response ? e.response.data : e.message
      });
    }
  };

  render() {
    const {
      balance, utxoCount, transactions, total, page, error, loading
    } = this.state;
    const { address } = this.props.match.params;
    const lastPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

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
          <Detail>
            <DKey>주소</DKey>
            <DValue mono>{address}</DValue>
            <DKey>잔액</DKey>
            <DValue>{formatLim(balance)} LIM</DValue>
            <DKey>미사용 출력</DKey>
            <DValue>{utxoCount}개</DValue>
          </Detail>
        </Card>

        <SectionTitle style={{ marginTop: 30 }}>
          트랜잭션
          <SectionNote>전체 {total.toLocaleString()}건</SectionNote>
        </SectionTitle>
        <Card>
          <Head>
            <Cell>Block</Cell>
            <Cell>Tx ID</Cell>
            <Cell>받음</Cell>
            <Cell hideBelow="sm">보냄</Cell>
            <Cell hideBelow="md">Timestamp</Cell>
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
                <In>{tx.received > 0 ? `+${formatLim(tx.received)}` : "—"}</In>
                <Out hideBelow="sm">
                  {tx.spent > 0 ? `−${formatLim(tx.spent)}` : "—"}
                </Out>
                <Time hideBelow="md">{makeDate(tx.timestamp)}</Time>
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
