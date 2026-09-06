import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Header from "Components/Header";
import Home from "Routes/Home";
import Blocks from "Routes/Blocks";
import Transactions from "Routes/Transactions";
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

/*
 * 총 발행량.
 *
 * 반감기가 생겨 블록마다 보상이 다르고, 코인베이스는 보조금에 더해 그 블록에
 * 담긴 수수료도 가져간다. 수수료는 이미 유통 중이던 코인이 옮겨 간 것이므로
 * 새로 발행된 양이 아니다. 따라서 코인베이스 지급액에서 수수료를 빼야 한다.
 */
const computeStats = (blocks, transactions) => {
  const newest = blocks.length > 0 ? blocks[0] : null;

  const feeByBlock = new Map();
  transactions.forEach(tx => {
    if (tx.fee !== null) {
      feeByBlock.set(tx.blockIndex, (feeByBlock.get(tx.blockIndex) || 0) + tx.fee);
    }
  });

  const supply = blocks.reduce((total, block) => {
    const coinbase = (block.data || [])[0];
    if (!coinbase) {
      return total;
    }
    const paid = coinbase.txOuts.reduce((sum, out) => sum + out.amount, 0);
    return total + paid - (feeByBlock.get(block.index) || 0);
  }, 0);

  return {
    height: newest ? newest.index : 0,
    txCount: transactions.length,
    difficulty: newest ? newest.difficulty : 0,
    supply
  };
};

const AppPresenter = ({ isLoading, error, blocks }) => {
  // 수수료 계산에는 체인 전체가 필요하므로 여기서 한 번에 파생시킨다
  const transactions = enrichTransactions(blocks);

  return (
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
};

AppPresenter.propTypes = {
  isLoading: PropTypes.bool.isRequired,
  error: PropTypes.string,
  blocks: PropTypes.array
};

export default AppPresenter;
