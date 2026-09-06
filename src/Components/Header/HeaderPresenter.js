import React from "react";
import styled from "styled-components";
import { Link, NavLink } from "react-router-dom";

const TitleLink = styled(Link)`
  color: inherit;
`;

const Title = styled.h1`
  margin: 0;
`;

const HeaderContainer = styled.header`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 50px 20px;
`;

const HeaderWrapper = styled.div`
  max-width: 1000px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
`;

const Nav = styled.nav`
  width: 70%;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex-wrap: wrap;
`;

const List = styled.ul`
  display: flex;
  margin: 0;
  align-items: center;
flex-wrap: wrap;
`;

const ListItem = styled.li`
  margin-bottom: 0;
  margin-right: 50px;
`;

const SLink = styled(NavLink)`
  text-decoration: none;
  font-weight: 600;
  color: #676767;
  &.active {
    color: black;
  }
`;

const HeaderPresenter = () => {
  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Title>
          <TitleLink to="/">LimCoin</TitleLink>
        </Title>
        <Nav>
          <List>
            <ListItem>
              <SLink exact to="/" activeClassName="active">
                Home
              </SLink>
            </ListItem>
            <ListItem>
              <SLink to="/blocks" activeClassName="active">
                Blocks
              </SLink>
            </ListItem>
            <ListItem>
              <SLink to="/transactions" activeClassName="active">
                Transactions
              </SLink>
            </ListItem>
          </List>
        </Nav>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default HeaderPresenter;
