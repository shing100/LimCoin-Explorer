import React, { Component } from "react";
import { setPageMeta } from "../../meta";
import BlocksPresenter from "./BlocksPresenter";
import PropTypes from "prop-types";

class BlocksContainer extends Component {
  componentDidMount() {
    setPageMeta("블록", "LimCoin 블록 목록. 높이, 해시, 시각, 난이도를 봅니다.");
  }

  render() {
    return <BlocksPresenter {...this.props}/>;
  }
}

BlocksContainer.propTypes = {
  blocks: PropTypes.array.isRequired
};

export default BlocksContainer;
