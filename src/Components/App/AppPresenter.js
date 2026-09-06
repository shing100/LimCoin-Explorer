import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import Header from "Components/Header";
import Home from "Routes/Home";
import Blocks from "Routes/Blocks";
import Transactions from "Routes/Transactions";
import Block from "Routes/Block";
import Transaction from "Routes/Transaction";
import Address from "Routes/Address";
import { radius } from "../../theme";
import { enrichTransactions } from "../../txinfo";

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

const AppPresenter = ({
  isLoading, error, blocks, info, page, total, pageSize, onPage, mempool, live
}) => {
  /*
   * 수수료를 알려면 입력이 가리키는 이전 출력을 되짚어야 한다. 지금 받아 둔
   * 페이지 안에서만 되짚을 수 있으므로, 더 오래된 블록을 참조하는 입력은
   * 수수료가 null 로 남는다. 상세 페이지에서는 노드에 직접 물어본다.
   */
  const transactions = enrichTransactions(blocks);

  const stats = info
    ? {
        height: info.height,
        txCount: info.txCount,
        difficulty: info.difficulty,
        supply: info.supply
      }
    : { height: 0, txCount: 0, difficulty: 0, supply: 0 };

  const pager = { page, total, pageSize, onPage };

  return (
    <BrowserRouter>
      <Shell>
        <Header live={live} />
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
                      stats={stats}
                      mempool={mempool}
                      mempoolFees={info ? info.mempoolFees : 0}
                    />
                  )}
                />
                <Route
                  exact
                  path="/blocks"
                  render={() => <Blocks blocks={blocks} pager={pager} />}
                />
                <Route
                  exact
                  path="/transactions"
                  render={() => (
                    <Transactions
                      transactions={transactions}
                      mempool={mempool}
                      mempoolFees={info ? info.mempoolFees : 0}
                    />
                  )}
                />
                <Route path="/block/:hash" component={Block} />
                <Route path="/height/:height" component={Block} />
                <Route path="/tx/:id" component={Transaction} />
                <Route path="/address/:address" component={Address} />
                <Redirect to="/" />
              </Switch>
            )}
        </Main>
      </Shell>
    </BrowserRouter>
  );
};

AppPresenter.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  blocks: PropTypes.array,
  info: PropTypes.object,
  page: PropTypes.number,
  total: PropTypes.number,
  pageSize: PropTypes.number,
  onPage: PropTypes.func,
  mempool: PropTypes.array,
  live: PropTypes.bool
};

export default AppPresenter;
