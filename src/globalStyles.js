import { injectGlobal } from "styled-components";
import reset from "styled-reset";
import theme, { sans } from "./theme";

const vars = palette =>
  Object.keys(palette)
    .map(key => `--${key}: ${palette[key]};`)
    .join("\n    ");

const baseStyles = () => injectGlobal`
  ${reset};

  :root {
    ${vars(theme.light)}
    color-scheme: light;
  }

  @media (prefers-color-scheme: dark) {
    :root {
      ${vars(theme.dark)}
      color-scheme: dark;
    }
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
