import React, { Component } from "react";
import AppPresenter from "./AppPresenter";
import baseStyles from "../../globalStyles";
import { WS_URL } from "../../constants";
import { getBlocks, getInfo, getMempool } from "../../api";
import { parseMessage, MESSAGE } from "../../utils";

baseStyles();

// 한 페이지에 보여 줄 블록 수. 홈은 이 중 앞의 몇 개만 쓴다.
const PAGE_SIZE = 25;

/*
 * 소켓이 끊기면 다시 붙는다.
 *
 * 예전에는 close 에서 this.ws 를 비우는 게 전부였다. 노드를 재시작하거나
 * 잠깐 네트워크가 흔들리면 그 뒤로 화면이 영원히 멈춰 있었다 — 새로고침
 * 전까지는 새 블록이 오지 않는다는 것을 알 방법도 없었다.
 *
 * 곧바로 다시 붙으려 하면 노드가 죽어 있는 동안 연결 시도로 도배하게 되니
 * 실패할 때마다 간격을 두 배로 늘린다.
 */
const RECONNECT_MIN = 1000;
const RECONNECT_MAX = 30000;

class AppContainer extends Component {
  state = {
    isLoading: true,
    error: null,
    blocks: [],
    info: null,
    page: 0,
    total: 0,
    mempool: [],
    live: false
  };

  retryDelay = RECONNECT_MIN;

  componentDidMount = () => {
    this._getData();
    this._connectToWs();
  };

  componentWillUnmount = () => {
    this.unmounted = true;
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
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
      const [info, { blocks, total }, mempool] = await Promise.all([
        getInfo(),
        getBlocks(PAGE_SIZE, page * PAGE_SIZE),
        getMempool()
      ]);
      if (this.unmounted) {
        return;
      }
      this.setState({
        info, blocks, total, mempool, page, isLoading: false, error: null
      });
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

  _refresh = () => {
    Promise.all([getInfo(), getMempool()])
      .then(([info, mempool]) => {
        if (!this.unmounted) {
          this.setState({ info, mempool });
        }
      })
      .catch(() => {});
  };

  _connectToWs = () => {
    if (this.unmounted) {
      return;
    }
    let ws;
    try {
      ws = new WebSocket(WS_URL);
    } catch (e) {
      console.error(e);
      this._scheduleReconnect();
      return;
    }
    this.ws = ws;

    ws.addEventListener("open", () => {
      this.retryDelay = RECONNECT_MIN;
      if (this.unmounted) {
        return;
      }
      this.setState({ live: true });
      // 다시 붙은 것이라면 끊겨 있는 동안 붙은 블록이 있을 수 있다.
      // (처음 붙는 것이면 componentDidMount 가 이미 받아 왔다)
      if (this.everConnected) {
        this._getData(this.state.page);
      }
      this.everConnected = true;
    });
    // error 뒤에는 항상 close 가 이어지므로 재연결은 close 에서만 건다
    ws.addEventListener("error", () => {});
    ws.addEventListener("close", () => {
      this.ws = null;
      if (this.unmounted) {
        return;
      }
      this.setState({ live: false });
      this._scheduleReconnect();
    });
    ws.addEventListener("message", this._onMessage);
  };

  _scheduleReconnect = () => {
    if (this.unmounted || this.retryTimer) {
      return;
    }
    const delay = this.retryDelay;
    this.retryDelay = Math.min(delay * 2, RECONNECT_MAX);
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this._connectToWs();
    }, delay);
  };

  _onMessage = message => {
    const parsed = parseMessage(message);
    if (parsed === null) {
      return;
    }

    /*
     * 누군가 트랜잭션을 보내면 노드가 그 한 건을 흘려 준다 (mempool 전체를
     * 줄 때도 있다). 교체하지 않고 id 로 합친다 — 한 건만 왔을 때 교체하면
     * 대기 목록이 그 한 건으로 줄어 버린다. 블록에 담겨 빠지는 것은 블록
     * 메시지 뒤의 _refresh 가 처리한다.
     */
    if (parsed.type === MESSAGE.MEMPOOL) {
      const incoming = Array.isArray(parsed.data) ? parsed.data : [];
      this.setState(prev => {
        const known = new Set(prev.mempool.map(tx => tx.id));
        const fresh = incoming.filter(tx => tx && !known.has(tx.id));
        return fresh.length === 0 ? null : { mempool: [...prev.mempool, ...fresh] };
      });
      return;
    }
    if (parsed.type !== MESSAGE.BLOCKS || parsed.data.length === 0) {
      return;
    }
    const newBlocks = parsed.data;

    // 첫 페이지를 보고 있을 때만 실시간으로 끼워 넣는다.
    // 뒤쪽 페이지를 보는 중에 목록이 밀리면 읽는 사람이 혼란스럽다.
    if (this.state.page !== 0) {
      this.setState(prev => ({ total: prev.total + newBlocks.length }));
      this._refresh();
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
    // 통계와 대기 목록은 새로 받아 온다 (블록에 담긴 것은 빠져야 한다)
    this._refresh();
  };
}

export default AppContainer;
