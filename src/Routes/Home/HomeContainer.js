import React, { Component } from "react";
import HomePresenter from "./HomePresenter";
import PropTypes from "prop-types";

class HomeContainer extends Component {
  render() {
    return <HomePresenter {...this.props}/>;
  }
}

HomeContainer.propTypes = {
  blocks: PropTypes.array.isRequired,
  transactions: PropTypes.array.isRequired
};

export default HomeContainer;
