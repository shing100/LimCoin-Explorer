import React, { Component } from "react";
import { injectGlobal } from "styled-components";
import AppPresenter from "./AppPresenter";
import axios from "axios";
import reset from "styled-reset";
import typography from "../../typography";
import { API_URL } from "../../constants";

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
  }
  render() {
    baseStyles();
    return <AppPresenter {...this.state} />;
  }
  _getData = async() => {
    const request = await axios.get(`${API_URL}/blocks`);
    //console.log(request);
    const blocks = request.data;
    this.setState({
      blocks,
      isLoading: false
    });
  }
}

export default AppContainer;
