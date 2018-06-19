import React, { Component } from "react";
import { injectGlobal } from "styled-components";
import AppPresenter from "./AppPresenter";
import reset from "styled-reset";

const baseStyles = () => injectGlobal`
    ${reset}
`;

class AppContainer extends Component {
  render() {
    baseStyles();
    return <AppPresenter />;
  }
}

export default AppContainer;
