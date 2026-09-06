import React, { Component, Fragment } from "react";
import sum from "lodash.sum";
import { getBlock, getBlocks } from "../../api";
import { makeDate } from "../../utils";
import { enrichTransactions } from "../../txinfo";
import {
  Card, SectionTitle, SectionNote, Detail, DKey, DValue, Back, Empty,
  TxHeader, TxRow, Pill
} from "Components/Shared";

class Block extends Component {
  state = { block: null, error: null, loading: true };

  componentDidMount() {
    this._load();
  }

  componentDidUpdate(prev) {
    if (prev.match.params.hash !== this.props.match.params.hash) {
      this._load();
    }
  }

  _load = async () => {
    const { hash, height } = this.props.match.params;
    this.setState({ loading: true, error: null });
    try {
      let block;
      if (hash) {
        block = await getBlock(hash);
      } else {
        // 높이로 들어온 경우. 노드에 높이 조회가 없어 목록에서 집어 온다.
        // 전체 개수는 X-Total-Count 헤더에서 온다.
        const { total } = await getBlocks(1, 0);
        const target = Number(height);
        if (!Number.isInteger(target) || target < 0 || target >= total) {
          throw new Error(`범위를 벗어난 블록 높이입니다 (0 ~ ${total - 1})`);
        }
        // 최신순으로 오므로 offset = (총 개수 - 1) - 높이
        const page = await getBlocks(1, total - 1 - target);
        block = page.blocks[0];
        if (!block) {
          throw new Error("블록을 찾을 수 없습니다");
        }
      }
      this.setState({ block, loading: false });
    } catch (e) {
      this.setState({
        loading: false,
        error: e.response ? e.response.data : e.message
      });
    }
  };

  render() {
    const { block, error, loading } = this.state;

    if (loading) {
      return <Empty>불러오는 중…</Empty>;
    }
    if (error) {
      return (
        <Fragment>
          <Back to="/blocks">← 블록 목록</Back>
          <Card><Empty>{error}</Empty></Card>
        </Fragment>
      );
    }

    // 수수료를 알려면 입력을 되짚어야 하는데, 이 블록만으로는 이전 블록의
    // 출력을 볼 수 없다. 그래서 여기서는 수수료를 비워 둔다.
    const txs = enrichTransactions([block]);

    return (
      <Fragment>
        <Back to="/blocks">← 블록 목록</Back>
        <SectionTitle>
          블록 #{block.index}
          <SectionNote>
            {block.index === 0 && <Pill>제네시스</Pill>}
          </SectionNote>
        </SectionTitle>
        <Card>
          <Detail>
            <DKey>높이</DKey>
            <DValue>{block.index}</DValue>
            <DKey>해시</DKey>
            <DValue mono>{block.hash}</DValue>
            <DKey>이전 블록</DKey>
            <DValue mono>{block.previousHash || "—"}</DValue>
            <DKey>머클 루트</DKey>
            <DValue mono>{block.merkleRoot}</DValue>
            <DKey>시각</DKey>
            <DValue>{makeDate(block.timestamp)}</DValue>
            <DKey>난이도</DKey>
            <DValue>{block.difficulty}</DValue>
            <DKey>Nonce</DKey>
            <DValue>{block.nonce.toLocaleString()}</DValue>
            <DKey>트랜잭션</DKey>
            <DValue>{(block.data || []).length}건</DValue>
          </Detail>
        </Card>

        <SectionTitle style={{ marginTop: 30 }}>담긴 트랜잭션</SectionTitle>
        <Card>
          <TxHeader />
          {txs.length === 0 ? (
            <Empty>없습니다.</Empty>
          ) : (
            txs.map(tx => (
              <TxRow
                key={tx.id}
                id={tx.id}
                timestamp={makeDate(tx.timestamp)}
                insOuts={`${tx.txIns.length}/${tx.txOuts.length}`}
                amount={sum(tx.txOuts.map(txOut => txOut.amount))}
                fee={tx.fee}
              />
            ))
          )}
        </Card>
      </Fragment>
    );
  }
}

export default Block;
