import React, { Fragment } from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { makeDate } from "../../utils";
import { CardBoard, BlocksHeader, BlocksRow } from "Components/Shared";

const TableContainer = styled.div`
  margin-top: 50px;
  margin-bottom: 100px;
`;

const BlocksPresenter = ( { blocks, transactions } ) => (
  <Fragment>
    <TableContainer>
      <h2>Latest Blocks</h2>
      <CardBoard>
        <BlocksHeader />
        {blocks.map((block, index) => (
          <BlocksRow
            index={block.index}
            hash={block.hash}
            timestamp={makeDate(block.timestamp)}
            difficulty={block.difficulty}
            key={index}
          />
        ))}
      </CardBoard>
    </TableContainer>
  </Fragment>
);

BlocksPresenter.propTypes = {
  blocks: PropTypes.array.isRequired
};

export default BlocksPresenter;
