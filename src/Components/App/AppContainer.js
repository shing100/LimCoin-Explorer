import React, { Component } from "react";
import AppPresenter from "./AppPresenter";
import axios from "axios";
import baseStyles from "../../globalStyles";
import { API_URL, WS_URL } from "../../constants";
import { parseMessage } from "../../utils";

baseStyles();

class AppContainer extends Component {
  state = {
    isLoading: true,
    error: null,
    blocks: []
  };
  componentDidMount = () => {
    this._getData();
    this._connectToWs();
  }
  componentWillUnmount = () => {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  render() {
    return <AppPresenter {...this.state} />;
  }
  _getData = async() => {
    try {
      const request = await axios.get(`${API_URL}/blocks`);
      // reverse() 는 원본을 뒤집으므로 복사본을 만든다
      this.setState({
        blocks: [...request.data].reverse(),
        isLoading: false,
        error: null
      });
    } catch (e) {
      // 예전에는 여기서 그냥 reject 되어 isLoading 이 true 로 굳었고,
      // 노드가 꺼져 있으면 화면이 영원히 비어 있었다.
      console.error(e);
      this.setState({
        isLoading: false,
        error: `LimCoin 노드(${API_URL})에 연결할 수 없습니다.`
      });
    }
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
    ws.addEventListener("close", () => { this.ws = null; });
    ws.addEventListener("message", message => {
      const newBlocks = parseMessage(message);
      // 이미 알고 있는 블록이 되돌아오는 경우가 있어 index 로 중복을 걸러 낸다.
      if (!Array.isArray(newBlocks) || newBlocks.length === 0) {
        return;
      }
      this.setState(prevState => {
        const known = new Set(prevState.blocks.map(block => block.index));
        const fresh = newBlocks.filter(block => !known.has(block.index));
        if (fresh.length === 0) {
          return null;
        }
        return { blocks: [...fresh, ...prevState.blocks] };
      });
    });
  };
}

export default AppContainer;
