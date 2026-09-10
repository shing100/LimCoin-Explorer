import React from "react";
import PropTypes from "prop-types";
import logo from "../../logo.json";

/*
 * LimCoin 마크.
 *
 * 금화(원) 안에 블록 네 개로 쌓은 L — 세로로 셋, 오른쪽 아래로 뻗은 발 하나.
 * 블록 사이의 틈이 "이어 붙인 블록"을 말한다.
 *
 * 작은 데서 무너지지 않는 것을 첫 조건으로 잡았다. 틈을 넓게 벌린 시안은
 * 512px 에서는 그럴듯한데 16px 파비콘에서 점 세 개로 뭉개졌다. 지금 틈은
 * 1/64 이라 16px 에서는 사라져 통짜 L 로 읽히고, 48px 부터 블록이 보인다.
 *
 * 색은 **테마를 따르지 않는다.** 라이트/다크 어느 쪽에서도 같은 금색 원에
 * 같은 검은 블록이다. 처음에는 다른 요소들처럼 테마 토큰(--accent)을 썼는데,
 * 라이트에서 원이 짙은 갈색(#936615)이 되어 "금화"로 보이지 않았고 무엇보다
 * **탭의 파비콘과 화면 속 로고가 서로 다른 물건처럼** 보였다. 상표는 배경이
 * 바뀐다고 색이 바뀌는 것이 아니다.
 *
 * 흰 배경 위에서 금색 원의 테두리 대비는 약하지만, 안의 검은 블록이 형태를
 * 잡아 준다. 명암비 기준(WCAG 1.4.11)도 로고타입은 대상에서 빼 준다.
 *
 * 모양의 원본은 src/logo.json 이다. 여기서 좌표를 고치지 말 것 —
 * 파비콘·PWA 아이콘이 같은 파일에서 만들어진다(scripts/icons.js).
 */
const Logo = ({ size, disc, ink, title }) => (
  <svg
    width={size}
    height={size}
    viewBox={`0 0 ${logo.viewBox} ${logo.viewBox}`}
    role={title ? "img" : "presentation"}
    aria-label={title || undefined}
    aria-hidden={title ? undefined : "true"}
    style={{ flex: "none", display: "block" }}
  >
    <circle cx={logo.disc.cx} cy={logo.disc.cy} r={logo.disc.r} fill={disc} />
    {logo.blocks.map(([x, y, w, h]) => (
      <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx={logo.rx} fill={ink} />
    ))}
  </svg>
);

Logo.propTypes = {
  size: PropTypes.number,
  disc: PropTypes.string,
  ink: PropTypes.string,
  // 글자로 읽어 줄 이름. 옆에 "LimCoin" 이 적혀 있으면 비워 둔다(두 번 읽힌다).
  title: PropTypes.string
};

Logo.defaultProps = {
  size: 26,
  disc: logo.gold,
  ink: logo.ink,
  title: ""
};

export default Logo;
