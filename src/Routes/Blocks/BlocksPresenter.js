import React from "react";
import PropTypes from "prop-types";
import { makeDate } from "../../utils";
import {
  Card, SectionTitle, SectionNote, BlocksHeader, BlocksRow, Empty
} from "Components/Shared";

const BlocksPresenter = ({ blocks }) => (
  <section>
    <SectionTitle>
      블록
      <SectionNote>{blocks.length}개 표시 중</SectionNote>
    </SectionTitle>
    <Card>
      <BlocksHeader />
      {blocks.length === 0 ? (
        <Empty>아직 블록이 없습니다.</Empty>
      ) : (
        blocks.map(block => (
          <BlocksRow
            index={block.index}
            hash={block.hash}
            timestamp={makeDate(block.timestamp)}
            difficulty={block.difficulty}
            key={block.hash}
          />
        ))
      )}
    </Card>
  </section>
);

BlocksPresenter.propTypes = {
  blocks: PropTypes.array.isRequired
};

export default BlocksPresenter;
