import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Header from "Components/Header";
import Home from "Routes/Home";
import Blocks from "Routes/Blocks";
import Transactions from "Routes/Transactions";

const AppContainer = styled.div`
  background-color: #fafafa;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Main = styled.main`
  max-width: 1000px;
  width: 100%;
  @media screen and (max-width: 600px) {
    width: 95%;
  }
`;

const AppPresenter = () => (
  <BrowserRouter>
    <AppContainer>
      <Header />
      <Main>
        <Switch>
          <Route exact path={`/`} component={Home} />
          <Route exact path={`/blocks`} component={Blocks} />
          <Route exact path={`/transactions`} component={Transactions} />
        </Switch>
      </Main>
    </AppContainer>
  </BrowserRouter>
);

export default AppPresenter;
