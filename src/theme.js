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

export const mono =
  '"SF Mono", "JetBrains Mono", "Fira Code", Menlo, Consolas, "D2Coding", monospace';

/*
 * 웹폰트를 받아오지 않는다. 로컬 노드를 보는 도구가 네트워크에 매달릴 이유가 없다.
 * 한글 이름은 플랫폼마다 다르다 — 지갑 쪽 theme.js 의 주석 참고.
 */
export const sans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, ' +
  '"Apple SD Gothic Neo", "Noto Sans KR", "Noto Sans CJK KR", "Malgun Gothic", ' +
  '"맑은 고딕", Helvetica, Arial, sans-serif';

export const breakpoint = { md: "860px", sm: "620px" };

export default { light, dark };
