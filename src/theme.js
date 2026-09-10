/*
 * 익스플로러 전역 디자인 토큰.
 *
 * 지갑(LimCoin-Wallet/uidev/src/theme.js)과 **같은 값**을 쓴다. 두 앱이 같은
 * 체인의 두 얼굴이라 색이 조금씩 어긋나면 다른 제품처럼 보인다. 예전에는
 * "같은 디자인 언어를 쓴다"고 적어 두고 실제로는 배경·테두리·본문색·그림자가
 * 미묘하게 달랐다. 값을 바꿀 때는 두 파일을 같이 고칠 것.
 *
 * 다른 것은 기본 밝기뿐이다 — 웹 익스플로러는 라이트가 기본, 데스크톱 지갑은
 * 다크가 기본이고, 둘 다 OS 설정을 따른다.
 *
 * 색은 눈으로 고르지 않았다. 얹히는 모든 배경에서 WCAG AA(4.5:1)를 넘는
 * 값을 계산해서 잡았다. 자세한 내력은 지갑 쪽 theme.js 에 적어 두었다.
 */
const light = {
  bg: "#f4f5f7",
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  surfaceSunken: "#f0f2f5",
  border: "#e3e6ea",
  borderStrong: "#cfd4da",
  text: "#1a1f26",
  textMuted: "#5c6672",
  textFaint: "#666f7a",
  accent: "#936615",
  accentText: "#ffffff",
  accentSoft: "rgba(147, 102, 21, 0.09)",
  /*
   * 배지 바탕은 **불투명**하다. 반투명이면 무엇 위에 얹히느냐에 따라 밝기가
   * 달라져, 카드 위에서는 통과하던 배지가 페이지 배경 위에서 4.1:1 로 떨어졌다.
   * 바탕을 고정하고 그 바탕에 맞는 글자색을 따로 둔다.
   */
  accentBadge: "#f2ede3",
  accentBadgeText: "#8f6314",
  positive: "#1a7f37",
  negative: "#cf222e",
  // 아이콘 배지 바탕. 이 위에 positive/negative 글자가 얹히므로 함께 잡는다.
  positiveSoft: "rgba(26, 127, 55, 0.08)",
  negativeSoft: "rgba(207, 34, 46, 0.08)",
  shadow: "0 1px 2px rgba(16,22,26,.06), 0 8px 24px rgba(16,22,26,.08)"
};

const dark = {
  bg: "#0d1117",
  surface: "#161b22",
  surfaceRaised: "#1c2129",
  surfaceSunken: "#0d1117",
  border: "#272e39",
  borderStrong: "#39424f",
  text: "#e6edf3",
  textMuted: "#8b949e",
  textFaint: "#808892",
  accent: "#e0a82e",
  accentText: "#1a1206",
  accentSoft: "rgba(224, 168, 46, 0.14)",
  accentBadge: "#363224",
  accentBadgeText: "#e0a82e",
  positive: "#3fb950",
  negative: "#f85149",
  positiveSoft: "rgba(63, 185, 80, 0.12)",
  negativeSoft: "rgba(248, 81, 73, 0.10)",
  shadow: "0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.28)"
};

export const radius = { sm: "6px", md: "10px", lg: "14px" };

/*
 * 간격은 4의 배수로만 쓴다.
 *
 * 예전에는 1, 2, 5, 7, 10, 11, 14, 18, 30, 34, 44, 60px 이 뒤섞여 있었다.
 * 값 하나하나는 그럴듯해도 모아 놓으면 리듬이 없어서, 카드마다 여백이
 * 조금씩 다르고 어디를 고쳐야 맞는지 알 수 없었다. 스케일을 정해 두면
 * 고를 것이 줄고 두 앱이 같은 리듬을 갖는다.
 *
 * 이름은 쓰임새로 붙인다 — 숫자를 외우지 않아도 되게.
 */
export const space = {
  xs: "4px",    // 붙어 있는 것들 사이 (아이콘과 글자)
  sm: "8px",    // 한 덩어리 안에서
  md: "12px",   // 줄 사이, 칸 안쪽 여백
  lg: "16px",   // 카드 사이, 카드 안쪽 여백
  xl: "24px",   // 구획 사이
  xxl: "32px",  // 화면 위아래 여백
  huge: "48px"  // 화면 아래 남기는 자리
};

/*
 * 누르는 것의 최소 크기.
 *
 * 마우스로는 28px 도 눌리지만 손가락으로는 아니다. 좁은 화면에서만 키우면
 * 데스크톱이 헐거워 보이지 않으면서 휴대폰에서 누를 수 있다.
 */
export const tap = { mouse: "36px", touch: "44px" };

export const mono =
  '"SF Mono", "JetBrains Mono", "Fira Code", Menlo, Consolas, "D2Coding", monospace';

/*
 * 웹폰트를 받아오지 않는다. 로컬 노드를 보는 도구가 네트워크에 매달릴 이유가 없다.
 * 한글 이름은 플랫폼마다 다르다 — 지갑 쪽 theme.js 의 주석 참고.
 */
/*
 * Pretendard 를 먼저 쓴다. 리포에 함께 둔 것이라 네트워크를 타지 않는다
 * (public/fonts/pretendard, SIL OFL 1.1).
 *
 * 뒤는 그대로 남겨 둔다 — 폰트 파일을 못 읽는 상황(캐시 실패, 파일 누락)에서도
 * 화면이 굴림 같은 옛 글꼴로 떨어지지 않게 하려는 것이다. font-display: swap
 * 이라 Pretendard 가 늦게 와도 글자가 먼저 보이고, 그동안 이 목록이 쓰인다.
 */
export const sans =
  '"Pretendard Variable", Pretendard, ' +
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ' +
  '"Apple SD Gothic Neo", "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", ' +
  '"맑은 고딕", Helvetica, Arial, sans-serif';

export const breakpoint = { md: "860px", sm: "620px", stack: "780px" };

export default { light, dark };
