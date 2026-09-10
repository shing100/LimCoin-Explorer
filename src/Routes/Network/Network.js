import React, { Component } from "react";
import styled from "styled-components";
import {
  Card, SectionTitle, SectionNote, Detail, DKey, DValue, Empty, Pill
} from "Components/Shared";
import { getFees, getPeerDetail, getKnownPeers } from "../../api";
import { setPageMeta } from "../../meta";
import { toKorean } from "../../errors";
import { formatLim } from "../../units";
import { formatDifficulty, difficultyFromBits } from "../../utils";
import { space, mono, breakpoint, radius } from "../../theme";

/*
 * 망 상태.
 *
 * 노드는 /info, /fees, /peers/detail, /peers/known 을 다 내주고 있었는데
 * 화면이 없었다. 상장 심사에서 "노드가 몇 개나 붙어 있나", "지금 수수료는
 * 얼마인가"를 물으면 보여 줄 곳이 없었다는 뜻이다.
 */
const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${space.md};
  margin-bottom: ${space.xl};
`;

const Tile = styled.div`
  padding: ${space.lg};
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: ${radius.md};
  box-shadow: var(--shadow);
`;

const Key = styled.p`
  margin: 0 0 ${space.xs};
  font-size: 12px;
  font-weight: 600;
  color: var(--textMuted);
`;

const Value = styled.p`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
`;

const Unit = styled.span`
  margin-left: 5px;
  font-size: 13px;
  font-weight: 600;
  color: var(--accent);
`;

const Section = styled.section`
  margin-bottom: ${space.xl};
`;

const PeerRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px 120px;
  gap: ${space.md};
  align-items: center;
  padding: ${space.md} ${space.lg};
  border-bottom: 1px solid var(--border);
  &:last-child { border-bottom: none; }

  @media (max-width: ${breakpoint.sm}) {
    grid-template-columns: minmax(0, 1fr) 88px;
    padding: ${space.md};
    & > :last-child { display: none; }
  }
`;

const PeerAddr = styled.span`
  font-family: ${mono};
  font-size: 12.5px;
  overflow-wrap: anywhere;
`;

const Muted = styled.span`
  font-size: 12.5px;
  color: var(--textMuted);
  overflow-wrap: anywhere;
`;

const Note = styled.p`
  margin: 0;
  padding: ${space.lg};
  font-size: 13px;
  line-height: 1.7;
  color: var(--textMuted);
`;

class Network extends Component {
  state = { fees: null, peers: [], known: [], error: null, loading: true };

  componentDidMount() {
    setPageMeta("네트워크", "LimCoin 노드 상태, 붙어 있는 피어, 권장 수수료.");
    this._load();
    // 피어와 수수료는 자주 바뀐다
    this._timer = setInterval(this._load, 8000);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  _load = async () => {
    try {
      const [fees, peers, known] = await Promise.all([
        getFees(),
        getPeerDetail(),
        getKnownPeers()
      ]);
      this.setState({ fees, peers, known, error: null, loading: false });
    } catch (e) {
      this.setState({
        loading: false,
        error: toKorean(e.response ? e.response.data : e.message)
      });
    }
  };

  render() {
    const { fees, peers, known, error, loading } = this.state;
    const { info } = this.props;
    if (loading) {
      return <Empty>불러오는 중…</Empty>;
    }
    if (error) {
      return <Empty>{error}</Empty>;
    }
    return (
      <React.Fragment>
        <SectionTitle>네트워크</SectionTitle>
        <Grid>
          <Tile>
            <Key>붙어 있는 피어</Key>
            <Value>{peers.length}</Value>
          </Tile>
          <Tile>
            <Key>아는 피어 주소</Key>
            <Value>{known.length}</Value>
          </Tile>
          <Tile>
            <Key>권장 수수료</Key>
            <Value>
              {fees.perByte}
              <Unit>lm/byte</Unit>
            </Value>
          </Tile>
          <Tile>
            <Key>대기 중</Key>
            <Value>
              {fees.mempoolSize}
              <Unit>건</Unit>
            </Value>
          </Tile>
        </Grid>

        <Section>
          <SectionTitle>
            수수료
            {fees.congested && <Pill>혼잡</Pill>}
          </SectionTitle>
          <Card>
            <Detail>
              <DKey>바이트당</DKey>
              <DValue>{fees.perByte} lm</DValue>
              <DKey>보통 크기 트랜잭션</DKey>
              <DValue>
                {fees.typicalTx.bytes} 바이트 · {formatLim(fees.typicalTx.fee)} LIM
              </DValue>
              <DKey>대기 중인 트랜잭션</DKey>
              <DValue>
                {fees.mempoolSize}건 · {fees.mempoolBytes.toLocaleString()} 바이트
              </DValue>
              <DKey>블록 한도</DKey>
              <DValue>{fees.blockBytes.toLocaleString()} 바이트</DValue>
            </Detail>
          </Card>
        </Section>

        <Section>
          <SectionTitle>
            피어
            <SectionNote>{peers.length}개 연결됨</SectionNote>
          </SectionTitle>
          <Card>
            {peers.length === 0 ? (
              <Note>
                붙어 있는 피어가 없습니다. 이 노드는 혼자 돌고 있습니다 —
                다른 노드의 블록을 받지 못하고, 만든 블록도 아무 데도 가지 않습니다.
                <br />
                노드를 띄울 때 <code>LIMCOIN_PEERS=ws://호스트:포트</code> 로 붙이거나,
                토큰을 가진 쪽에서 <code>POST /peers</code> 를 부르면 됩니다.
              </Note>
            ) : (
              peers.map((peer, i) => (
                <PeerRow key={peer.url || `peer-${i}`}>
                  <PeerAddr>{peer.url || "들어온 연결"}</PeerAddr>
                  <Muted>{peer.encrypted ? "암호화됨" : "평문"}</Muted>
                  <Muted>{peer.peerId ? peer.peerId.slice(0, 16) + "…" : "신원 없음"}</Muted>
                </PeerRow>
              ))
            )}
          </Card>
        </Section>

        {info && (
          <Section>
            <SectionTitle>이 노드</SectionTitle>
            <Card>
              <Detail>
                <DKey>망</DKey>
                <DValue>{info.network}</DValue>
                <DKey>버전</DKey>
                <DValue>{info.version}</DValue>
                <DKey>높이</DKey>
                <DValue>{info.height.toLocaleString()}</DValue>
                <DKey>난이도</DKey>
                <DValue title={`bits 0x${(info.bits || 0).toString(16)}`}>
                  {formatDifficulty(difficultyFromBits(info.bits))}
                </DValue>
                <DKey>체인 무게</DKey>
                <DValue mono>{info.chainWork}</DValue>
                <DKey>제네시스</DKey>
                <DValue mono>{info.genesisHash}</DValue>
                <DKey>노드 id</DKey>
                <DValue mono>{info.nodeId || "—"}</DValue>
                <DKey>전송 암호화</DKey>
                <DValue>{info.encryption || "—"}</DValue>
                <DKey>지갑</DKey>
                <DValue>
                  {info.walletEnabled
                    ? info.walletLocked
                      ? "켜짐 (잠김)"
                      : "켜짐"
                    : "꺼짐 (이 노드에는 키가 없습니다)"}
                </DValue>
              </Detail>
            </Card>
          </Section>
        )}
      </React.Fragment>
    );
  }
}

export default Network;
