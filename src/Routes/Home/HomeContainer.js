import React, { Component } from "react";
import { setPageMeta } from "../../meta";
import HomePresenter from "./HomePresenter";
import PropTypes from "prop-types";

class HomeContainer extends Component {
  componentDidMount() {
    setPageMeta(null, "LimCoin 블록체인 익스플로러. 최근 블록과 트랜잭션, 대기 중인 트랜잭션을 봅니다.");
  }

  render() {
    return <HomePresenter {...this.props}/>;
  }
}

HomeContainer.propTypes = {
  blocks: PropTypes.array.isRequired,
  transactions: PropTypes.array.isRequired,
  mempool: PropTypes.array.isRequired
};

export default HomeContainer;
