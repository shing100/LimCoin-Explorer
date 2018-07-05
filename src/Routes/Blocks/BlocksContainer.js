import React, { Component } from "react";
import BlocksPresenter from "./BlocksPresenter";
import PropTypes from "prop-types";

class BlocksContainer extends Component {
  render() {
    return <BlocksPresenter />;
  }
}

BlocksContainer.propTypes = {
  blocks: PropTypes.array.isRequired
};

export default BlocksContainer;
