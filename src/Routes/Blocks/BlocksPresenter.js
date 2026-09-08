import React, { Fragment } from "react";
import PropTypes from "prop-types";
import { makeDate } from "../../utils";
import {
  Card, SectionTitle, SectionNote, BlocksHeader, BlocksRow, Empty,
  Pager, PagerButton
} from "Components/Shared";

const BlocksPresenter = ({ blocks, pager }) => {
  const { page, total, pageSize, onPage } = pager;
  const lastPage = Math.max(0, Math.ceil(total / pageSize) - 1);

  return (
    <Fragment>
      <SectionTitle>
        블록
        <SectionNote>전체 {total.toLocaleString()}개</SectionNote>
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
              bits={block.bits}
              key={block.hash}
            />
          ))
        )}
      </Card>
      {lastPage > 0 && (
        <Pager>
          <PagerButton onClick={() => onPage(page - 1)} disabled={page === 0}>
            ← 최신
          </PagerButton>
          <span>
            {page + 1} / {lastPage + 1}
          </span>
          <PagerButton
            onClick={() => onPage(page + 1)}
            disabled={page >= lastPage}
          >
            이전 →
          </PagerButton>
        </Pager>
      )}
    </Fragment>
  );
};

BlocksPresenter.propTypes = {
  blocks: PropTypes.array.isRequired,
  pager: PropTypes.object.isRequired
};

export default BlocksPresenter;
