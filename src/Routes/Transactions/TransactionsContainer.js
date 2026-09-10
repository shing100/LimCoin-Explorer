import React, { Component } from "react";
import { setPageMeta } from "../../meta";
import TransactionsPresenter from "./TransactionsPresenter";
import PropTypes from "prop-types";

class TransactionsContainer extends Component {
  componentDidMount() {
    setPageMeta("트랜잭션", "LimCoin 트랜잭션 목록. 금액, 수수료, 입출력, 시각을 봅니다.");
  }

  render() {
    return <TransactionsPresenter {...this.props} />;
  }
}

TransactionsContainer.propTypes = {
  transactions: PropTypes.array.isRequired,
  mempool: PropTypes.array.isRequired
};

export default TransactionsContainer;
