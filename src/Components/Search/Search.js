import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
import { resolveQuery } from "../../search";
import { radius, mono, breakpoint } from "../../theme";

const Form = styled.form`
  position: relative;
  flex: 1;
  max-width: 380px;

  @media (max-width: ${breakpoint.md}) {
    order: 3;
    flex-basis: 100%;
    max-width: none;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  background: var(--surfaceSunken);
  border: 1px solid var(--border);
  border-radius: ${radius.sm};
  color: var(--text);
  font-family: ${mono};
  font-size: 12.5px;
  transition: border-color .15s, box-shadow .15s;

  &::placeholder { font-family: inherit; color: var(--textFaint); }

  &:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accentSoft);
  }
`;

const Error = styled.p`
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 2;
  margin: 0;
  padding: 8px 12px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: ${radius.sm};
  box-shadow: var(--shadow);
  font-size: 12px;
  color: var(--textMuted);
`;

class Search extends Component {
  state = { query: "", error: null, busy: false };

  _change = event => this.setState({ query: event.target.value, error: null });

  _submit = async event => {
    event.preventDefault();
    this.setState({ busy: true, error: null });
    // 64자 해시는 블록일 수도 트랜잭션일 수도 있어 노드에 물어봐야 한다
    const result = await resolveQuery(this.state.query);
    this.setState({ busy: false });
    if (result === null) {
      return;
    }
    if (result.error) {
      this.setState({ error: result.error });
      return;
    }
    this.setState({ query: "", error: null });
    this.props.history.push(result.path);
  };

  render() {
    const { query, error, busy } = this.state;
    return (
      <Form onSubmit={this._submit}>
        <Input
          value={query}
          onChange={this._change}
          disabled={busy}
          spellCheck="false"
          autoComplete="off"
          aria-label="검색"
          placeholder="블록 높이 · 해시 · 주소 검색"
        />
        {error && <Error>{error}</Error>}
      </Form>
    );
  }
}

export default withRouter(Search);
