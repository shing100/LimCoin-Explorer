import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Header from "Components/Header";
import Home from "Routes/Home";
import Blocks from "Routes/Blocks";
import Transactions from "Routes/Transactions";
import { radius } from "../../theme";

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Main = styled.main`
  flex: 1;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px 60px;
`;

const Message = styled.p`
  margin-top: 60px;
  padding: 18px;
  text-align: center;
  color: var(--textMuted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: ${radius.md};
`;

// 총 발행량은 코인베이스만 있으므로 블록 수 x 보상으로 계산해도 되지만,
// 보상이 바뀔 수 있으니 실제 코인베이스 출력을 더한다.
const computeStats = (blocks, transactions) => {
  const newest = blocks.length > 0 ? blocks[0] : null;
  const supply = blocks.reduce((total, block) => {
    const coinbase = (block.data || [])[0];
    if (!coinbase) {
      return total;
    }
    return total + coinbase.txOuts.reduce((sum, out) => sum + out.amount, 0);
  }, 0);

  return {
    height: newest ? newest.index : 0,
    txCount: transactions.length,
    difficulty: newest ? newest.difficulty : 0,
    supply
  };
};

const AppPresenter = ({ isLoading, error, transactions, blocks }) => (
  <BrowserRouter>
    <Shell>
      <Header />
      <Main>
        {isLoading && <Message>블록체인을 불러오는 중…</Message>}
        {!isLoading && error && <Message>{error}</Message>}
        {!isLoading &&
          !error && (
            <Switch>
              <Route
                exact
                path="/"
                render={() => (
                  <Home
                    blocks={blocks.slice(0, 5)}
                    transactions={transactions.slice(0, 5)}
                    stats={computeStats(blocks, transactions)}
                  />
                )}
              />
              <Route
                exact
                path="/blocks"
                render={() => <Blocks blocks={blocks.slice(0, 25)} />}
              />
              <Route
                exact
                path="/transactions"
                render={() => (
                  <Transactions transactions={transactions.slice(0, 25)} />
                )}
              />
            </Switch>
          )}
      </Main>
    </Shell>
  </BrowserRouter>
);

AppPresenter.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  transactions: PropTypes.array,
  blocks: PropTypes.array
};

export default AppPresenter;
