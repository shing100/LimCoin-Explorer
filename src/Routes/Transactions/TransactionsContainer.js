import React, { Component } from "react";
import TransactionsPresenter from "./TransactionsPresenter";
import PropTypes from "prop-types";

class TransactionsContainer extends Component {
  render() {
    return <TransactionsPresenter />;
  }
}

TransactionsContainer.propTypes = {
  transactions: PropTypes.array.isRequired
};

export default TransactionsContainer;
