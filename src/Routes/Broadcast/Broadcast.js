import React, { Component } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Card, SectionTitle, PagerButton, Pill } from "Components/Shared";
import { broadcastRawTx } from "../../api";
import { setPageMeta } from "../../meta";
import { toKorean } from "../../errors";
import { space, mono, radius, breakpoint, tap } from "../../theme";

/*
 * 밖에서 서명한 트랜잭션을 이 노드에 넣는다.
 *
 * 거래소와 콜드월렛은 키를 노드에 두지 않는다(EXCHANGE.md 4절). 서명은
 * 밖에서 하고 완성된 것만 던지는데, 지금까지 그 창구가 curl 뿐이었다.
 *
 * 여기서 키를 다루지 않는다는 점이 중요하다 — 이 화면은 이미 서명이 끝난
 * JSON 을 받아 그대로 전달할 뿐이다. 개인키를 넣는 칸은 없고, 있어서도 안 된다.
 */
const Body = styled.div`
  padding: ${space.lg};

  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.md};
  }
`;

const Lead = styled.p`
  margin: 0 0 ${space.md};
  font-size: 13px;
  line-height: 1.7;
  color: var(--textMuted);
`;

const Area = styled.textarea`
  width: 100%;
  min-height: 200px;
  padding: ${space.md};
  background: var(--surfaceSunken);
  border: 1px solid var(--border);
  border-radius: ${radius.sm};
  color: var(--text);
  font-family: ${mono};
  font-size: 12.5px;
  line-height: 1.6;
  resize: vertical;

  &::placeholder { color: var(--textFaint); }
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accentSoft);
  }
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${space.md};
  margin-top: ${space.md};
  flex-wrap: wrap;
`;

const Send = styled(PagerButton)`
  min-height: ${tap.mouse};
  background: var(--accent);
  border-color: var(--accent);
  color: var(--accentText);
  font-weight: 700;

  &:hover:not(:disabled) {
    border-color: var(--accent);
    color: var(--accentText);
    filter: brightness(1.06);
  }

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
  }
`;

const Result = styled.p`
  margin: ${space.md} 0 0;
  padding: ${space.md};
  border-radius: ${radius.sm};
  font-size: 13px;
  line-height: 1.7;
  overflow-wrap: anywhere;
  background: ${props => (props.bad ? "var(--negativeSoft)" : "var(--positiveSoft)")};
  color: ${props => (props.bad ? "var(--negative)" : "var(--positive)")};
  border: 1px solid ${props => (props.bad ? "var(--negative)" : "var(--positive)")};
`;

const Sample = styled.pre`
  margin: ${space.md} 0 0;
  padding: ${space.md};
  overflow-x: auto;
  background: var(--surfaceSunken);
  border-radius: ${radius.sm};
  font-family: ${mono};
  font-size: 11.5px;
  line-height: 1.6;
  color: var(--textMuted);
`;

const SAMPLE = `{
  "id": "<txid — 직렬화한 바이트의 sha256d>",
  "txIns": [
    {
      "txOutId": "<쓸 출력이 담긴 트랜잭션 id>",
      "txOutIndex": 0,
      "signature": "<개인키로 txid 에 한 DER 서명 (low-S)>",
      "publicKey": "<그 주소의 공개키 hex>"
    }
  ],
  "txOuts": [
    { "address": "<받는 주소>", "amount": 100000000 },
    { "address": "<거스름돈 주소>", "amount": 49999000 }
  ],
  "lockTime": 0
}`;

class Broadcast extends Component {
  state = { text: "", busy: false, result: null };

  componentDidMount() {
    setPageMeta("트랜잭션 보내기", "밖에서 서명한 raw 트랜잭션을 이 노드에 제출합니다.");
  }

  _send = async () => {
    const raw = this.state.text.trim();
    if (raw === "") {
      this.setState({ result: { bad: true, text: "보낼 트랜잭션을 붙여 넣어 주세요." } });
      return;
    }
    let tx;
    try {
      tx = JSON.parse(raw);
    } catch (e) {
      this.setState({
        result: { bad: true, text: `JSON 을 읽을 수 없습니다: ${e.message}` }
      });
      return;
    }
    this.setState({ busy: true, result: null });
    try {
      const accepted = await broadcastRawTx(tx);
      this.setState({
        busy: false,
        result: { bad: false, id: accepted.id, text: "받아들였습니다. mempool 에 들어갔습니다." }
      });
    } catch (e) {
      this.setState({
        busy: false,
        result: { bad: true, text: toKorean(e.response ? e.response.data : e.message) }
      });
    }
  };

  render() {
    const { text, busy, result } = this.state;
    return (
      <section>
        <SectionTitle>
          트랜잭션 보내기
          <Pill>서명된 것만</Pill>
        </SectionTitle>
        <Card>
          <Body>
            <Lead>
              이미 서명이 끝난 트랜잭션을 이 노드에 넣습니다. 노드는 규칙을 확인하고
              통과하면 mempool 에 담아 다른 노드로 퍼뜨립니다.
              <br />
              <strong>이 화면은 개인키를 받지 않습니다.</strong> 서명은 키가 있는
              곳(콜드월렛, 거래소 시스템)에서 하고 결과만 여기 붙여 넣으세요.
            </Lead>
            <Area
              value={text}
              onChange={e => this.setState({ text: e.target.value })}
              placeholder="서명된 트랜잭션 JSON 을 붙여 넣으세요"
              spellCheck={false}
              disabled={busy}
            />
            <Actions>
              <Send as="button" onClick={this._send} disabled={busy}>
                {busy ? "보내는 중…" : "보내기"}
              </Send>
              <PagerButton
                as="button"
                onClick={() => this.setState({ text: "", result: null })}
                disabled={busy || text === ""}
              >
                지우기
              </PagerButton>
            </Actions>
            {result && (
              <Result bad={result.bad}>
                {result.text}
                {result.id && (
                  <React.Fragment>
                    {" "}
                    <Link to={`/tx/${result.id}`}>{result.id}</Link>
                  </React.Fragment>
                )}
              </Result>
            )}
            <Lead style={{ marginTop: space.xl, marginBottom: 0 }}>
              형식은 이렇습니다. 금액은 최소 단위(lm) 정수이고, 수수료는 별도 항목이
              아니라 <code>Σ입력 − Σ출력</code> 입니다.
            </Lead>
            <Sample>{SAMPLE}</Sample>
          </Body>
        </Card>
      </section>
    );
  }
}

export default Broadcast;
