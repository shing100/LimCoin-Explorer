import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";
import { radius } from "../../theme";
import { qrMatrix } from "../../qr";

/*
 * 주소 QR.
 *
 * 색을 테마에 맞추지 않고 언제나 검정/흰색으로 그린다. 다크 모드에서 흰
 * 코드를 어두운 바탕에 뒤집어 그리면 보기에는 어울리지만, 반전된 QR 을 못
 * 읽는 스캐너가 아직 많다. 주소를 잘못 옮기면 돈이 사라지는 일이라
 * "예쁘게"보다 "반드시 읽힌다"가 먼저다.
 *
 * 여백(quiet zone) 4칸도 규격이 요구하는 것이다. 없으면 바탕과 코드의
 * 경계를 스캐너가 못 찾는다.
 */
const QUIET = 4;

const Box = styled.div`
  flex: none;
  padding: 10px;
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: ${radius.md};
  line-height: 0;
`;

const Fallback = styled.p`
  margin: 0;
  font-size: 12px;
  color: var(--textMuted);
`;

const QrCode = ({ value, size, title }) => {
  const modules = qrMatrix(value);
  if (modules === null) {
    // 담을 수 없이 긴 값. 그림 대신 아무것도 그리지 않는다 — 글자는 옆에 이미 있다.
    return <Fallback>QR 로 담기에 너무 긴 값입니다.</Fallback>;
  }

  const n = modules.length;
  const span = n + QUIET * 2;

  /*
   * 칸마다 <rect> 를 두면 41×41 코드에서 요소가 800개 넘게 생긴다.
   * 경로 하나에 모아 그린다 — 브라우저가 훨씬 덜 힘들어한다.
   */
  const parts = [];
  for (let y = 0; y < n; y++) {
    let run = 0;
    for (let x = 0; x <= n; x++) {
      if (x < n && modules[y][x]) {
        run++;
      } else if (run > 0) {
        // 가로로 이어진 칸은 하나의 직사각형으로 합친다
        parts.push(`M${x - run + QUIET},${y + QUIET}h${run}v1h-${run}z`);
        run = 0;
      }
    }
  }

  return (
    <Box>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${span} ${span}`}
        shapeRendering="crispEdges"
        role="img"
        aria-label={title}
      >
        <rect width={span} height={span} fill="#ffffff" />
        <path d={parts.join("")} fill="#000000" />
      </svg>
    </Box>
  );
};

QrCode.propTypes = {
  value: PropTypes.string.isRequired,
  size: PropTypes.number,
  title: PropTypes.string
};

QrCode.defaultProps = { size: 132, title: "QR 코드" };

export default QrCode;
