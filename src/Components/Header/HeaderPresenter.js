import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { Link, NavLink } from "react-router-dom";
import { breakpoint, radius, space, tap } from "../../theme";
import Search from "Components/Search";
import ThemeToggle from "Components/ThemeToggle";

const Bar = styled.header`
  width: 100%;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
`;

const Inner = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 0 ${space.xl};
  min-height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${space.lg};
  flex-wrap: wrap;

  @media (max-width: ${breakpoint.md}) {
    padding: ${space.md} ${space.lg};
  }

  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.md};
    gap: ${space.md};
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${space.sm};
  /* 로고도 링크다 — 손가락으로 누를 만한 높이를 준다 */
  min-height: ${tap.mouse};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
  }
`;

const Coin = styled.span`
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--accent);
  color: var(--surface);
  font-size: 13px;
  font-weight: 800;
`;

/*
 * 좁은 화면에서 숨기는 묶음.
 *
 * 메뉴가 다섯이면 390px 에서 두 줄이 되고 검색창이 아래로 밀린다. 검색이
 * 익스플로러의 주 동선이라 그쪽을 지킨다 — 숨긴 화면은 홈 아래쪽 링크와
 * 직접 주소로 갈 수 있다.
 */
const WideOnly = styled.span`
  display: contents;

  @media (max-width: ${breakpoint.md}) {
    display: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${space.xs};
`;

/*
 * 예전에는 window.location.pathname 으로 활성 여부를 계산했다.
 * 이 값이 바뀌어도 리렌더가 일어나지 않아 메뉴를 옮겨도 강조가 그대로였다.
 * NavLink 는 라우터가 직접 active 클래스를 붙여 준다.
 */
const NavItem = styled(NavLink)`
  display: inline-flex;
  align-items: center;
  /*
   * 마우스로는 28px 도 눌리지만 손가락으로는 아니다. 좁은 화면에서만
   * 44px 로 키운다 — 데스크톱이 헐거워 보이지 않으면서 휴대폰에서 눌린다.
   */
  min-height: ${tap.mouse};
  padding: ${space.sm} ${space.md};
  border-radius: ${radius.sm};
  font-size: 13.5px;
  font-weight: 600;
  color: var(--textMuted);
  transition: background .12s, color .12s;

  &:hover { background: var(--surfaceSunken); color: var(--text); }

  &.active {
    background: var(--accentSoft);
    color: var(--accent);
  }

  @media (max-width: ${breakpoint.sm}) {
    min-height: ${tap.touch};
    padding: ${space.sm} ${space.md};
  }
`;

/*
 * 새 블록이 실시간으로 들어오고 있는지.
 *
 * 예전에는 소켓이 끊겨도 화면에 아무 표시가 없었다. 멈춘 화면과
 * "블록이 안 나오는 중"을 구별할 방법이 없었다.
 */
const Live = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${space.xs};
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.03em;
  color: ${props => (props.on ? "var(--accent)" : "var(--textMuted)")};

  &::before {
    content: "";
    flex: none;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => (props.on ? "var(--accent)" : "var(--border)")};
  }

  /*
   * 좁은 화면에서는 점만 남긴다. 글자는 자리를 너무 많이 차지하고,
   * 연결 상태는 오히려 작은 화면에서 더 알고 싶은 것이다.
   *
   * 예전에는 font-size: 0 으로 지웠다. 눈에는 같아 보이지만 "0px 글자"가
   * 남아 있는 셈이라, 화면을 읽어 주는 도구나 글자 크기를 키운 사용자에게
   * 이상하게 걸린다. 자리만 없애고 글자는 그대로 두는 방법을 쓴다.
   */
  @media (max-width: ${breakpoint.sm}) {
    gap: 0;

    /* 스크린 리더는 읽고 화면에서는 사라진다 */
    & > span {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
    }
  }
`;

const HeaderPresenter = ({ live }) => (
  <Bar>
    <Inner>
      <Brand to="/">
        <Coin>L</Coin>
        LimCoin
        <Live on={live} title={live ? "노드와 연결되어 있습니다" : "연결이 끊겼습니다. 다시 붙는 중입니다."}>
          <span>{live ? "실시간" : "연결 끊김"}</span>
        </Live>
      </Brand>
      <Search />
      <Nav>
        <NavItem exact to="/" activeClassName="active">
          홈
        </NavItem>
        <NavItem to="/blocks" activeClassName="active">
          블록
        </NavItem>
        <NavItem to="/transactions" activeClassName="active">
          트랜잭션
        </NavItem>
        {/* 좁은 화면에서는 접는다 — 넣으면 한 줄을 넘겨 검색창을 밀어낸다 */}
        <WideOnly>
          <NavItem to="/charts" activeClassName="active">
            차트
          </NavItem>
          <NavItem to="/richlist" activeClassName="active">
            부자 목록
          </NavItem>
          <NavItem to="/network" activeClassName="active">
            네트워크
          </NavItem>
        </WideOnly>
        {/*
          밝기 단추는 접지 않는다. 좁은 화면(휴대폰)이야말로 밖에서 밝은 데
          있거나 침대에서 보는 쪽이라 더 자주 쓴다. 아이콘 하나라 자리도 덜 먹는다.
        */}
        <ThemeToggle />
      </Nav>
    </Inner>
  </Bar>
);

HeaderPresenter.propTypes = {
  live: PropTypes.bool
};

export default HeaderPresenter;
