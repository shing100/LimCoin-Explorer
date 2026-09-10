import React, { Component } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { radius, space, tap, breakpoint } from "../../theme";

/*
 * 값 복사 단추.
 *
 * 주소를 손으로 옮겨 적다가 한 글자 틀리면 돈이 없는 주소로 간다. 두 번
 * 클릭으로 글자를 고르는 방법은 긴 해시에서 잘 안 되고(줄바꿈이 섞인다),
 * 휴대폰에서는 더 어렵다.
 *
 * navigator.clipboard 는 https 또는 localhost 에서만 동작한다. 사내망에
 * http 로 띄운 익스플로러에서는 없는 것이나 마찬가지라 옛 방법을 남겨 둔다.
 */
const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${space.xs};
  flex: none;
  min-height: ${tap.mouse};
  min-width: ${tap.mouse};
  padding: 0 ${space.sm};
  border: 1px solid var(--border);
  border-radius: ${radius.sm};
  background: var(--surface);
  color: ${props => (props.done ? "var(--positive)" : "var(--textMuted)")};
  font-size: 12px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  white-space: nowrap;

  &:hover { border-color: var(--borderStrong); color: var(--text); }
  &:focus-visible {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px var(--accentSoft);
  }

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
    min-width: ${tap.touch};
  }
`;

const legacyCopy = text => {
  const area = document.createElement("textarea");
  area.value = text;
  // 화면 밖에 두되 readOnly 로 둔다 — iOS 는 보이지 않는 요소를 못 고른다
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.top = "-1000px";
  document.body.appendChild(area);
  area.select();
  area.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (e) {
    ok = false;
  }
  document.body.removeChild(area);
  return ok;
};

class CopyButton extends Component {
  state = { done: false, failed: false };

  componentWillUnmount() {
    clearTimeout(this._timer);
  }

  _flash = ok => {
    this.setState({ done: ok, failed: !ok });
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this.setState({ done: false, failed: false }), 1600);
  };

  _copy = async () => {
    const { value } = this.props;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(value);
        this._flash(true);
        return;
      } catch (e) {
        /* 권한이 없거나 http 다 — 옛 방법으로 */
      }
    }
    this._flash(legacyCopy(value));
  };

  render() {
    const { label } = this.props;
    const { done, failed } = this.state;
    const text = done ? "복사됨" : failed ? "복사 실패" : label;
    return (
      <Button
        type="button"
        onClick={this._copy}
        done={done}
        /* 상태가 바뀌면 읽어 주는 도구에도 알린다 */
        aria-live="polite"
        title={`${label}: ${this.props.value}`}
      >
        {text}
      </Button>
    );
  }
}

CopyButton.propTypes = {
  value: PropTypes.string.isRequired,
  label: PropTypes.string
};

CopyButton.defaultProps = { label: "복사" };

export default CopyButton;
