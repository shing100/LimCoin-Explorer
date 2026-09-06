import React, { Component, Fragment } from "react";
import styled from "styled-components";
import { getTransaction, getTxProof } from "../../api";
import { formatLim } from "../../units";
import {
  Card, SectionTitle, SectionNote, Detail, DKey, DValue, Back, Empty,
  MonoLink, Pill
} from "Components/Shared";
import { mono } from "../../theme";

const Columns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 30px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const IO = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }
`;

const IOAmount = styled.p`
  margin: 0 0 4px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
`;

const Proof = styled.ol`
  margin: 0;
  padding: 12px 16px 12px 34px;
  font-family: ${mono};
  font-size: 12px;
  color: var(--textMuted);
  overflow-wrap: anywhere;

  li { margin-bottom: 6px; }
  li:last-child { margin-bottom: 0; }
`;

const Side = styled.span`
  display: inline-block;
  min-width: 42px;
  color: var(--accent);
  font-weight: 700;
`;

const isCoinbase = tx =>
  tx.txIns.length === 1 && tx.txIns[0].txOutId === "";

class Transaction extends Component {
  state = { tx: null, proof: null, error: null, loading: true };

  componentDidMount() {
    this._load();
  }

  componentDidUpdate(prev) {
    if (prev.match.params.id !== this.props.match.params.id) {
      this._load();
    }
  }

  _load = async () => {
    const { id } = this.props.match.params;
    this.setState({ loading: true, error: null, proof: null });
    try {
      const tx = await getTransaction(id);
      this.setState({ tx, loading: false });
      // 증명은 부수적이라 실패해도 본문은 보여 준다
      // (mempool 에 있는 트랜잭션은 아직 블록에 없으므로 증명이 없다)
      try {
        this.setState({ proof: await getTxProof(id) });
      } catch (e) {
        this.setState({ proof: null });
      }
    } catch (e) {
      this.setState({
        loading: false,
        error: e.response ? e.response.data : e.message
      });
    }
  };

  render() {
    const { tx, proof, error, loading } = this.state;

    if (loading) {
      return <Empty>불러오는 중…</Empty>;
    }
    if (error) {
      return (
        <Fragment>
          <Back to="/transactions">← 트랜잭션 목록</Back>
          <Card><Empty>{error}</Empty></Card>
        </Fragment>
      );
    }

    const outTotal = tx.txOuts.reduce((sum, txOut) => sum + txOut.amount, 0);

    return (
      <Fragment>
        <Back to="/transactions">← 트랜잭션 목록</Back>
        <SectionTitle>
          트랜잭션
          <SectionNote>{isCoinbase(tx) && <Pill>코인베이스</Pill>}</SectionNote>
        </SectionTitle>
        <Card>
          <Detail>
            <DKey>ID</DKey>
            <DValue mono>{tx.id}</DValue>
            <DKey>출력 합계</DKey>
            <DValue>{formatLim(outTotal)} LIM</DValue>
            <DKey>입력 / 출력</DKey>
            <DValue>{tx.txIns.length} / {tx.txOuts.length}</DValue>
            {proof && (
              <Fragment>
                <DKey>담긴 블록</DKey>
                <DValue>
                  <MonoLink to={`/block/${proof.blockHash}`}>
                    #{proof.blockIndex} · {proof.blockHash}
                  </MonoLink>
                </DValue>
              </Fragment>
            )}
          </Detail>
        </Card>

        <Columns>
          <div>
            <SectionTitle>입력</SectionTitle>
            <Card>
              {isCoinbase(tx) ? (
                <Empty>
                  코인베이스입니다. 참조하는 이전 출력이 없고, 블록 보조금과
                  그 블록의 수수료를 새로 발행합니다.
                </Empty>
              ) : (
                tx.txIns.map((txIn, i) => (
                  <IO key={i}>
                    <IOAmount>#{i}</IOAmount>
                    <MonoLink to={`/tx/${txIn.txOutId}`}>
                      {txIn.txOutId}:{txIn.txOutIndex}
                    </MonoLink>
                  </IO>
                ))
              )}
            </Card>
          </div>
          <div>
            <SectionTitle>출력</SectionTitle>
            <Card>
              {tx.txOuts.map((txOut, i) => (
                <IO key={i}>
                  <IOAmount>{formatLim(txOut.amount)} LIM</IOAmount>
                  <MonoLink to={`/address/${txOut.address}`}>
                    {txOut.address}
                  </MonoLink>
                </IO>
              ))}
            </Card>
          </div>
        </Columns>

        <SectionTitle style={{ marginTop: 30 }}>
          머클 증명
          <SectionNote>
            {proof
              ? `해시 ${proof.proof.length}개로 포함을 증명한다 (백서 8장 SPV)`
              : "아직 블록에 담기지 않았습니다"}
          </SectionNote>
        </SectionTitle>
        <Card>
          {proof && proof.proof.length > 0 ? (
            <Fragment>
              <Detail>
                <DKey>머클 루트</DKey>
                <DValue mono>{proof.merkleRoot}</DValue>
              </Detail>
              <Proof>
                {proof.proof.map((step, i) => (
                  <li key={i}>
                    <Side>{step.position === "left" ? "왼쪽" : "오른쪽"}</Side>
                    {step.hash}
                  </li>
                ))}
              </Proof>
            </Fragment>
          ) : (
            <Empty>
              {proof
                ? "블록에 이 트랜잭션 하나뿐이라 증명이 필요 없습니다. 머클 루트가 곧 이 트랜잭션의 id 입니다."
                : "mempool 에 있는 트랜잭션은 아직 증명할 블록이 없습니다."}
            </Empty>
          )}
        </Card>
      </Fragment>
    );
  }
}

export default Transaction;
