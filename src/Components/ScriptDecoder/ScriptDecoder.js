import React, { Component } from "react";
import styled from "styled-components";
import { Card, SectionTitle, Detail, DKey, DValue, PagerButton, Pill } from "Components/Shared";
import { decodeScript } from "../../api";
import { toKorean } from "../../errors";
import { space, mono, radius, breakpoint, tap } from "../../theme";

/*
 * P2SH 주소가 어떤 조건으로 잠겨 있는지 풀어 본다.
 *
 * M…/2… 주소는 **조건의 해시**다. 조건 자체(redeemScript)는 그 돈을 쓰는
 * 사람이 공개할 때까지 체인 어디에도 없다 — 그게 P2SH 의 요점이다.
 * 그래서 노드도 모르고, 사람이 붙여 넣어야 한다.
 *
 * 다중서명·타임락·HTLC 를 다 만들어 놓고 익스플로러에서 확인할 창구가
 * 없었다. 스크립트를 붙여 넣으면 (1) 이 주소가 맞는지 (2) 무슨 조건인지를
 * 노드가 알려 준다.
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
  min-height: 88px;
  padding: ${space.md};
  background: var(--surfaceSunken);
  border: 1px solid var(--border);
  border-radius: ${radius.sm};
  color: var(--text);
  font-family: ${mono};
  font-size: 12.5px;
  line-height: 1.6;
  resize: vertical;
  overflow-wrap: anywhere;

  &::placeholder { color: var(--textFaint); }
  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accentSoft);
  }
`;

const Actions = styled.div`
  display: flex;
  gap: ${space.md};
  margin-top: ${space.md};
`;

const Go = styled(PagerButton)`
  min-height: ${tap.mouse};
  @media (max-width: ${breakpoint.sm}) { min-height: ${tap.touch}; }
`;

const Bad = styled.p`
  margin: ${space.md} 0 0;
  padding: ${space.md};
  border-radius: ${radius.sm};
  font-size: 13px;
  line-height: 1.7;
  background: var(--negativeSoft);
  color: var(--negative);
  border: 1px solid var(--negative);
  overflow-wrap: anywhere;
`;

const Asm = styled.code`
  font-family: ${mono};
  font-size: 12.5px;
  overflow-wrap: anywhere;
`;

const KINDS = {
  multisig: "다중서명",
  timelock: "타임락 (CLTV)",
  htlc: "해시 타임락 (HTLC)",
  custom: "직접 짠 스크립트"
};

class ScriptDecoder extends Component {
  state = { text: "", busy: false, result: null, error: null };

  _decode = async () => {
    const redeemScript = this.state.text.trim();
    if (redeemScript === "") {
      this.setState({ error: "redeemScript 를 붙여 넣어 주세요.", result: null });
      return;
    }
    this.setState({ busy: true, error: null, result: null });
    try {
      const result = await decodeScript(redeemScript);
      this.setState({ busy: false, result });
    } catch (e) {
      this.setState({
        busy: false,
        error: toKorean(e.response ? e.response.data : e.message)
      });
    }
  };

  render() {
    const { text, busy, result, error } = this.state;
    const { address } = this.props;
    // 붙여 넣은 스크립트가 정말 이 주소의 것인가
    const matches = result && result.address === address;
    return (
      <React.Fragment>
        <SectionTitle style={{ marginTop: space.xxl }}>
          잠금 조건
          <Pill>P2SH</Pill>
        </SectionTitle>
        <Card>
          <Body>
            <Lead>
              이 주소는 <strong>조건의 해시</strong>입니다. 조건 자체는 돈을 쓰는
              사람이 공개할 때까지 체인에 없으므로 노드도 모릅니다 — 그게 P2SH 의
              요점입니다. 알고 있는 <code>redeemScript</code> 를 붙여 넣으면 이
              주소가 맞는지, 무슨 조건인지 확인해 줍니다.
            </Lead>
            <Area
              value={text}
              onChange={e => this.setState({ text: e.target.value })}
              placeholder="redeemScript hex (예: 5221…52ae)"
              spellCheck={false}
              disabled={busy}
            />
            <Actions>
              <Go as="button" onClick={this._decode} disabled={busy}>
                {busy ? "확인 중…" : "확인"}
              </Go>
              {(result || error) && (
                <PagerButton
                  as="button"
                  onClick={() => this.setState({ text: "", result: null, error: null })}
                >
                  지우기
                </PagerButton>
              )}
            </Actions>
            {error && <Bad>{error}</Bad>}
            {result && !matches && (
              <Bad>
                이 스크립트는 다른 주소의 것입니다. 붙여 넣은 것으로는{" "}
                <Asm>{result.address}</Asm> 가 나옵니다.
              </Bad>
            )}
          </Body>
          {result && matches && (
            <Detail>
              <DKey>종류</DKey>
              <DValue>{KINDS[result.script.type] || result.script.type}</DValue>
              {result.script.m !== undefined && (
                <React.Fragment>
                  <DKey>필요한 서명</DKey>
                  <DValue>
                    {result.script.m} / {(result.script.publicKeys || []).length}
                  </DValue>
                </React.Fragment>
              )}
              {result.script.lockTime !== undefined && (
                <React.Fragment>
                  <DKey>잠금 해제</DKey>
                  <DValue>
                    {result.script.lockTime < 500000000
                      ? `높이 ${result.script.lockTime} 부터`
                      : `${new Date(result.script.lockTime * 1000).toLocaleString("ko-KR")} 부터`}
                  </DValue>
                </React.Fragment>
              )}
              {result.script.hash && (
                <React.Fragment>
                  <DKey>비밀값 해시</DKey>
                  <DValue mono>{result.script.hash}</DValue>
                </React.Fragment>
              )}
              <DKey>읽은 내용</DKey>
              <DValue>
                <Asm>{result.asm}</Asm>
              </DValue>
            </Detail>
          )}
        </Card>
      </React.Fragment>
    );
  }
}

export default ScriptDecoder;
