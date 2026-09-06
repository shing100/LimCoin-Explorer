import React from "react";
import styled from "styled-components";
import { Link, NavLink } from "react-router-dom";
import { breakpoint } from "../../theme";

const Bar = styled.header`
  width: 100%;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
`;

const Inner = styled.div`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: 0 20px;
  height: 62px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.02em;
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

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 4px;
`;

/*
 * 예전에는 window.location.pathname 으로 활성 여부를 계산했다.
 * 이 값이 바뀌어도 리렌더가 일어나지 않아 메뉴를 옮겨도 강조가 그대로였다.
 * NavLink 는 라우터가 직접 active 클래스를 붙여 준다.
 */
const NavItem = styled(NavLink)`
  padding: 7px 12px;
  border-radius: 7px;
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
    padding: 7px 9px;
  }
`;

const HeaderPresenter = () => (
  <Bar>
    <Inner>
      <Brand to="/">
        <Coin>L</Coin>
        LimCoin
      </Brand>
      <Nav>
        <NavItem exact to="/" activeClassName="active">
          Home
        </NavItem>
        <NavItem to="/blocks" activeClassName="active">
          Blocks
        </NavItem>
        <NavItem to="/transactions" activeClassName="active">
          Transactions
        </NavItem>
      </Nav>
    </Inner>
  </Bar>
);

export default HeaderPresenter;
