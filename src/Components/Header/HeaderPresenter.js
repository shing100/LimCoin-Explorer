import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

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

const SLink = styled.span`
  text-decoration: none;
  font-weight: 600;
  color: ${props => (props.isActive ? "black" : "#676767")};
`;

const HeaderPresenter = props => {
  console.log(props);
  return (
    <HeaderContainer>
      <HeaderWrapper>
        <Title>
          <TitleLink to="/">LimCoin</TitleLink>
        </Title>
        <Nav>
          <List>
            <ListItem>
              <Link to="/">
                <SLink isActive={window.location.pathname === "/"}>
                  Home
                </SLink>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/blocks">
                <SLink isActive={window.location.pathname === "/blocks"}>
                  Blocks
                </SLink>
              </Link>
            </ListItem>
            <ListItem>
              <Link to="/transactions">
                <SLink isActive={window.location.pathname === "/transactions"}>
                  Transactions
                </SLink>
              </Link>
            </ListItem>
          </List>
        </Nav>
      </HeaderWrapper>
    </HeaderContainer>
  );
};

export default HeaderPresenter;
