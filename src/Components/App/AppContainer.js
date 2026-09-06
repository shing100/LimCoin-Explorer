import React, { Component } from "react";
import AppPresenter from "./AppPresenter";
import baseStyles from "../../globalStyles";
import { WS_URL } from "../../constants";
import { getBlocks, getInfo } from "../../api";
import { parseMessage } from "../../utils";

baseStyles();

// 한 페이지에 보여 줄 블록 수. 홈은 이 중 앞의 몇 개만 쓴다.
const PAGE_SIZE = 25;

class AppContainer extends Component {
  state = {
    isLoading: true,
    error: null,
    blocks: [],
    info: null,
    page: 0,
    total: 0
  };

  componentDidMount = () => {
    this._getData();
    this._connectToWs();
  };

  componentWillUnmount = () => {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.unmounted = true;
  };

  render() {
    return (
      <AppPresenter
        {...this.state}
        pageSize={PAGE_SIZE}
        onPage={this._goToPage}
      />
    );
  }

  _getData = async (page = 0) => {
    try {
      /*
       * 통계는 /info 에서 받는다. 예전에는 체인 전체를 받아 프론트에서
       * 세고 있었는데, 노드가 이제 최신순 한 페이지씩만 주므로 그럴 수 없다.
       */
      const [info, { blocks, total }] = await Promise.all([
        getInfo(),
        getBlocks(PAGE_SIZE, page * PAGE_SIZE)
      ]);
      if (this.unmounted) {
        return;
      }
      this.setState({ info, blocks, total, page, isLoading: false, error: null });
    } catch (e) {
      if (this.unmounted) {
        return;
      }
      console.error(e);
      this.setState({
        isLoading: false,
        error: "LimCoin 노드에 연결할 수 없습니다."
      });
    }
  };

  _goToPage = page => {
    this.setState({ isLoading: true });
    this._getData(page);
  };

  _connectToWs = () => {
    let ws;
    try {
      ws = new WebSocket(WS_URL);
    } catch (e) {
      console.error(e);
      return;
    }
    this.ws = ws;

    ws.addEventListener("error", e => console.error("WebSocket error", e));
    ws.addEventListener("close", () => {
      this.ws = null;
    });
    ws.addEventListener("message", message => {
      const newBlocks = parseMessage(message);
      if (!Array.isArray(newBlocks) || newBlocks.length === 0) {
        return;
      }
      // 첫 페이지를 보고 있을 때만 실시간으로 끼워 넣는다.
      // 뒤쪽 페이지를 보는 중에 목록이 밀리면 읽는 사람이 혼란스럽다.
      if (this.state.page !== 0) {
        this.setState(prev => ({ total: prev.total + newBlocks.length }));
        return;
      }
      this.setState(prev => {
        const known = new Set(prev.blocks.map(block => block.index));
        const fresh = newBlocks.filter(block => !known.has(block.index));
        if (fresh.length === 0) {
          return null;
        }
        return {
          blocks: [...fresh, ...prev.blocks].slice(0, PAGE_SIZE),
          total: prev.total + fresh.length
        };
      });
      // 통계는 새로 받아 온다
      getInfo()
        .then(info => !this.unmounted && this.setState({ info }))
        .catch(() => {});
    });
  };
}

export default AppContainer;
