// 개발 중에는 .env 나 셸에서 덮어쓸 수 있다.
//   REACT_APP_API_URL=http://localhost:4001 yarn start
const HOST = process.env.REACT_APP_API_HOST || "localhost:3000";

export const API_URL = process.env.REACT_APP_API_URL || `http://${HOST}`;
export const WS_URL = process.env.REACT_APP_WS_URL || `ws://${HOST}`;
