import React, { Component } from "react";
import { injectGlobal } from "styled-components";
import AppPresenter from "./AppPresenter";
import axios from "axios";
import reset from "styled-reset";
import typography from "../../typography";
import { API_URL, WS_USL } from "../../constants";
import flatten from "lodash.flatten";
import { parseMessage } from "../../utils";

const baseStyles = () => injectGlobal`
    ${reset};
    ${typography};
    a{
        text-decoration:none!important;
    }
`;

class AppContainer extends Component {
  state = {
    isLoading: true
  };
  componentDidMount = () => {
    this._getData();
    this._connectToWs();
  }
  render() {
    baseStyles();
    return <AppPresenter {...this.state} />;
  }
  _getData = async() => {
    const request = await axios.get(`${API_URL}/blocks`);
    //console.log(request);
    const blocks = request.data;
    const reversedBlocks = blocks.reverse();
    const txs = flatten(reversedBlocks.map(block => block.data));
    this.setState({
      blocks: reversedBlocks,
      transactions: txs,
      isLoading: false
    });
  };
  _connectToWs = () => {
    const ws = new WebSocket(WS_USL);
    ws.addEventListener("message", message => {
      const parsedMessage = parseMessage(message);
      if(parsedMessage !== null && parsedMessage !== undefined){
        this.setState(prevState => {
          return {
            ...prevState,
            blocks: [...parsedMessage, ...prevState.blocks],
            transactions: [...parsedMessage[0].data, ...prevState.transactions]
          }
        })
      }
    });
  };
}

export default AppContainer;
