import React, { Component } from "react";
import styled from "styled-components";
import { Card, SectionTitle, SectionNote, Pill } from "Components/Shared";
import { setPageMeta } from "../../meta";
import { API_URL } from "../../constants";
import { space, mono, radius, breakpoint } from "../../theme";

/*
 * 이 노드에 무엇을 물어볼 수 있는지.
 *
 * REST 와 JSON-RPC 를 둘 다 만들어 놓고 문서는 리포 안 마크다운에만 있었다.
 * 익스플로러를 보고 있는 사람이 "이 값을 프로그램으로 받으려면?" 하고
 * 생각했을 때 갈 곳이 없었다. 지금 보고 있는 그 노드의 주소로 바로
 * 시험해 볼 수 있게 한다.
 */
const Body = styled.div`
  padding: ${space.lg};

  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.md};
  }
`;

const Lead = styled.p`
  margin: 0 0 ${space.lg};
  font-size: 13px;
  line-height: 1.7;
  color: var(--textMuted);
`;

const Table = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 320px) minmax(0, 1fr);
  border-top: 1px solid var(--border);

  @media (max-width: ${breakpoint.md}) {
    grid-template-columns: 1fr;
  }
`;

const Path = styled.code`
  padding: ${space.md} ${space.lg};
  border-bottom: 1px solid var(--border);
  font-family: ${mono};
  font-size: 12.5px;
  color: var(--accent);
  overflow-wrap: anywhere;

  @media (max-width: ${breakpoint.md}) {
    padding-bottom: ${space.xs};
    border-bottom: none;
  }
`;

const What = styled.span`
  padding: ${space.md} ${space.lg};
  border-bottom: 1px solid var(--border);
  font-size: 13px;
  line-height: 1.6;
  color: var(--textMuted);
`;

const Block = styled.pre`
  margin: 0 0 ${space.lg};
  padding: ${space.md};
  overflow-x: auto;
  background: var(--surfaceSunken);
  border-radius: ${radius.sm};
  font-family: ${mono};
  font-size: 11.5px;
  line-height: 1.7;
`;

const Section = styled.section`
  margin-bottom: ${space.xl};
`;

const REST = [
  ["GET /info", "높이, 난이도, 발행량, 화폐 정책, 망 정보"],
  ["GET /health", "떠 있는지, 팁이 얼마나 오래됐는지"],
  ["GET /metrics", "Prometheus 형식"],
  ["GET /blocks?limit&offset", "블록 목록(최신순). 전체 개수는 X-Total-Count 헤더"],
  ["GET /blocks/:hash", "블록 하나"],
  ["GET /blocks/height/:h", "높이로 블록 하나"],
  ["GET /blocks/since/:hash", "그 블록 뒤의 블록들(≤500). 404 면 밀려난 것"],
  ["GET /transactions", "mempool"],
  ["GET /transactions/:id", "트랜잭션 하나 (confirmations 포함)"],
  ["GET /transactions/:id/proof", "머클 증명 (백서 8장)"],
  ["GET /address/:a", "잔액"],
  ["GET /address/:a/transactions?limit&offset", "주소 내역"],
  ["GET /address/:a/utxos", "미사용 출력"],
  ["GET /fees", "권장 수수료"],
  ["GET /richlist?limit", "잔액 많은 주소 순위 (≤500)"],
  ["GET /stats/blocks?limit", "최근 블록의 난이도·간격·트랜잭션 수 (≤2000)"],
  ["GET /peers · /peers/known · /peers/detail", "피어"],
  ["GET /search/:q", "높이·해시·주소 판별"],
  ["POST /transactions/raw", "서명된 트랜잭션 제출"],
  ["POST /script/address · /script/decode", "P2SH 주소 만들기 / 풀어 보기"],
  ["POST /transactions/build", "서명하지 않은 트랜잭션 짜 주기"]
];

const RPC = [
  ["체인", "getblockcount, getbestblockhash, getblockhash, getblock, getblockheader, getblockchaininfo, getdifficulty, getchaintips"],
  ["트랜잭션", "getrawtransaction, decoderawtransaction, sendrawtransaction, gettxout, validateaddress"],
  ["mempool", "getrawmempool, getmempoolinfo, estimatesmartfee"],
  ["망", "getconnectioncount, getnetworkinfo, getpeerinfo, uptime, help"],
  ["지갑 (토큰 필요)", "getwalletinfo, getnewaddress, getbalance, sendtoaddress, listunspent, listtransactions, walletpassphrase, walletlock"]
];

class Api extends Component {
  componentDidMount() {
    setPageMeta("API", "LimCoin 노드의 REST API 와 비트코인 호환 JSON-RPC.");
  }

  render() {
    return (
      <React.Fragment>
        <SectionTitle>
          API
          <SectionNote>{API_URL}</SectionNote>
        </SectionTitle>

        <Section>
          <Card>
            <Body>
              <Lead>
                이 익스플로러가 보고 있는 노드는 두 가지 얼굴을 갖습니다. 새로 짜는
                연동은 REST 가 편하고, 이미 비트코인용으로 만들어 둔 도구가 있다면
                JSON-RPC 를 그대로 쓸 수 있습니다.
                <br />
                금액은 REST 가 최소 단위(lm) 정수, JSON-RPC 가 LIM 소수입니다.
                1 LIM = 100,000,000 lm.
              </Lead>
              <Block>{`curl ${API_URL}/info`}</Block>
              <Block>{`curl ${API_URL}/rpc -H 'Content-Type: application/json' \\
  -d '{"jsonrpc":"2.0","id":1,"method":"getblockchaininfo"}'`}</Block>
            </Body>
          </Card>
        </Section>

        <Section>
          <SectionTitle>
            REST
            <SectionNote>읽기는 인증이 없습니다</SectionNote>
          </SectionTitle>
          <Card>
            <Table>
              {REST.map(([path, what]) => (
                <React.Fragment key={path}>
                  <Path>{path}</Path>
                  <What>{what}</What>
                </React.Fragment>
              ))}
            </Table>
          </Card>
        </Section>

        <Section>
          <SectionTitle>
            JSON-RPC
            <Pill>비트코인 호환</Pill>
          </SectionTitle>
          <Card>
            <Body>
              <Lead>
                <code>POST /rpc</code> 하나로 받습니다. 이름·응답 모양·오류 코드가
                비트코인 코어와 같습니다. 배치(배열)와 이름 인자를 받고,
                <strong> HTTP 상태는 언제나 200</strong> 입니다 — 배치 안의 요청이
                하나씩 따로 실패할 수 있어 상태 코드 하나로 표현할 수 없습니다.
                성공 여부는 본문의 <code>error</code> 로 판단하세요.
                <br />
                다른 점: 우리 출력에는 스크립트 대신 주소가 들어가므로
                <code> scriptPubKey.hex</code> 는 비어 있고, segwit 이 없어
                <code> vsize == size</code> 입니다.
              </Lead>
            </Body>
            <Table>
              {RPC.map(([group, methods]) => (
                <React.Fragment key={group}>
                  <Path>{group}</Path>
                  <What>{methods}</What>
                </React.Fragment>
              ))}
            </Table>
          </Card>
        </Section>
      </React.Fragment>
    );
  }
}

export default Api;
