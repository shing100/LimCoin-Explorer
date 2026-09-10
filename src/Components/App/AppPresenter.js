import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { BrowserRouter, Switch, Route, Link } from "react-router-dom";
import Header from "Components/Header";
import Home from "Routes/Home";
import Blocks from "Routes/Blocks";
import Transactions from "Routes/Transactions";
import Block from "Routes/Block";
import Transaction from "Routes/Transaction";
import Address from "Routes/Address";
import Network from "Routes/Network";
import Broadcast from "Routes/Broadcast";
import Api from "Routes/Api";
import NotFound from "Routes/NotFound";
import { radius, space, breakpoint, tap } from "../../theme";
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
  padding: ${space.xxl} ${space.xl} ${space.huge};

  @media (max-width: ${breakpoint.md}) {
    padding: ${space.xl} ${space.lg} ${space.xxl};
  }

  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.lg} ${space.md} ${space.xxl};
  }
`;

/*
 * 바닥 링크.
 *
 * 좁은 화면에서는 위 메뉴에서 네트워크·API 를 접는다(검색창을 밀어내므로).
 * 그러면 그 화면에 갈 길이 아예 없어지므로 여기에 둔다. 브로드캐스트는
 * 자주 쓰는 것이 아니라 위 메뉴에는 처음부터 넣지 않았다.
 */
const Footer = styled.footer`
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: ${space.xl} ${space.xl} ${space.xxl};
  display: flex;
  flex-wrap: wrap;
  gap: ${space.lg};
  border-top: 1px solid var(--border);
  font-size: 12.5px;
  color: var(--textMuted);

  @media (max-width: ${breakpoint.sm}) {
    padding: ${space.lg} ${space.md} ${space.xxl};
    gap: ${space.md};
  }

  /*
   * 바닥 링크도 누르는 자리다. 글자 높이(19px)만으로는 손가락이 빗나간다 —
   * 위 메뉴에서 고친 것과 같은 실수를 여기서 되풀이하지 않는다.
   */
  a {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: ${tap.mouse};
    /* 짧은 낱말("API")은 세로만 키워선 부족하다 — 가로도 함께 잡는다 */
    min-width: ${tap.mouse};
    padding: 0 ${space.xs};
    margin: 0 -${space.xs};
    border-radius: ${radius.sm};
    color: var(--textMuted);

    &:hover { color: var(--accent); }
    &:focus-visible {
      outline: none;
      box-shadow: 0 0 0 3px var(--accentSoft);
    }

    @media (max-width: ${breakpoint.sm}) {
      min-height: ${tap.touch};
      min-width: ${tap.touch};
    }
  }

  /* 링크가 아닌 글자는 링크 높이에 맞춰 세로 가운데로 */
  span {
    display: inline-flex;
    align-items: center;
    min-height: ${tap.mouse};
  }
`;

const Message = styled.p`
  margin-top: ${space.huge};
  padding: ${space.lg};
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
                <Route
                  exact
                  path="/network"
                  render={() => <Network info={info} />}
                />
                <Route exact path="/broadcast" component={Broadcast} />
                <Route exact path="/api" component={Api} />
                <Route path="/block/:hash" component={Block} />
                <Route path="/height/:height" component={Block} />
                <Route path="/tx/:id" component={Transaction} />
                <Route path="/address/:address" component={Address} />
                {/*
                  예전에는 여기서 홈으로 되돌렸다. 주소를 잘못 친 사람은
                  왜 홈에 와 있는지 모른 채 다시 치게 된다.
                */}
                <Route component={NotFound} />
              </Switch>
            )}
        </Main>
        <Footer>
          <Link to="/network">네트워크</Link>
          <Link to="/broadcast">트랜잭션 보내기</Link>
          <Link to="/api">API</Link>
          <span>
            {info ? `${info.network} · v${info.version}` : "LimCoin"}
          </span>
        </Footer>
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
