import React, { Component } from "react";
import PropTypes from "prop-types";
import HeaderPresenter from "./HeaderPresenter";

class HeaderContainer extends Component {
  render() {
    return <HeaderPresenter live={this.props.live} />;
  }
}

HeaderContainer.propTypes = {
  live: PropTypes.bool
};

export default HeaderContainer;
