// LimCoin Wallet 과 같은 디자인 언어를 쓴다(같은 강조색, 같은 반경/그림자 체계).
// 다만 익스플로러는 웹이므로 라이트를 기본으로 두고 다크는 OS 설정을 따른다.
const light = {
  bg: "#f6f7f9",
  surface: "#ffffff",
  surfaceSunken: "#f0f2f5",
  border: "#e4e7eb",
  borderStrong: "#cdd2d9",
  text: "#161b22",
  textMuted: "#5b6572",
  textFaint: "#8b949e",
  accent: "#b8801a",
  accentSoft: "rgba(184, 128, 26, 0.1)",
  shadow: "0 1px 2px rgba(16,22,26,.05), 0 6px 18px rgba(16,22,26,.06)"
};

const dark = {
  bg: "#0d1117",
  surface: "#161b22",
  surfaceSunken: "#0d1117",
  border: "#272e39",
  borderStrong: "#39424f",
  text: "#e6edf3",
  textMuted: "#8b949e",
  textFaint: "#6e7681",
  accent: "#e0a82e",
  accentSoft: "rgba(224, 168, 46, 0.14)",
  shadow: "0 1px 2px rgba(0,0,0,.4), 0 8px 24px rgba(0,0,0,.28)"
};

export const radius = { sm: "6px", md: "10px", lg: "14px" };

export const mono =
  '"SF Mono", "JetBrains Mono", "Fira Code", Menlo, Consolas, monospace';

// 웹폰트를 받아오지 않는다. 로컬 노드를 보는 도구가 네트워크에 매달릴 이유가 없다.
export const sans =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans KR", "Apple SD Gothic Neo", Roboto, Helvetica, Arial, sans-serif';

export const breakpoint = { md: "860px", sm: "620px" };

export default { light, dark };
