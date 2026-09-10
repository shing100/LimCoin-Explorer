import { injectGlobal } from "styled-components";
import reset from "styled-reset";
import theme, { sans } from "./theme";

const vars = palette =>
  Object.keys(palette)
    .map(key => `--${key}: ${palette[key]};`)
    .join("\n    ");

/*
 * 밝기는 세 갈래다 — 자동(OS 를 따름) · 라이트 · 다크.
 *
 * 예전에는 OS 설정만 따랐다. 그러면 밤에 OS 를 다크로 두는 사람이 낮에
 * 밝은 화면으로 이 사이트만 보고 싶을 때 방법이 없다. 반대도 마찬가지다.
 * 서버 화면을 종일 띄워 두는 도구라 이건 취향이 아니라 필요에 가깝다.
 *
 * 규칙의 순서가 곧 우선순위다.
 *   1. :root                        → 라이트가 바탕값
 *   2. @media dark, [data-theme] 없음 → OS 가 다크면 다크 (자동)
 *   3. :root[data-theme="dark"]      → 사람이 고른 다크가 OS 를 이긴다
 * 2 번에 :not([data-theme="light"]) 을 붙여 두지 않으면, OS 가 다크인 곳에서
 * 라이트를 골라도 미디어 쿼리가 도로 덮어쓴다.
 */
const baseStyles = () => injectGlobal`
  ${reset};

  :root {
    ${vars(theme.light)}
    color-scheme: light;
  }

  @media (prefers-color-scheme: dark) {
    :root:not([data-theme="light"]) {
      ${vars(theme.dark)}
      color-scheme: dark;
    }
  }

  :root[data-theme="dark"] {
    ${vars(theme.dark)}
    color-scheme: dark;
  }

  *, *::before, *::after { box-sizing: border-box; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: ${sans};
    font-size: 14px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default baseStyles;
