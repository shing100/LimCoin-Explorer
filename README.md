# LimCoin-Explorer

React 로 만든 LimCoin 블록 익스플로러.

## 시작하기

```bash
yarn install
yarn start        # http://localhost:3000
yarn build        # 배포용 정적 빌드
```

LimCoin 노드가 `http://localhost:3000` 에 떠 있다고 가정한다.
다른 곳을 보려면 환경변수로 덮어쓴다.

```bash
REACT_APP_API_HOST=localhost:4001 yarn start
# 또는 개별 지정
REACT_APP_API_URL=http://localhost:4001 REACT_APP_WS_URL=ws://localhost:4001 yarn start
```

노드에 붙지 못하면 화면에 그 이유를 표시한다.

# 라이브러리
- react, react-dom, react-router-dom, react-scripts
- prop-types
- typography
- styled-components, styled-reset
- axios
- lodash.flatten, lodash.sum

---
## Version infomation

    "axios": "^0.18.0",
    "lodash.flatten": "^4.4.0",
    "lodash.sum": "^4.0.2",
    "prop-types": "^15.6.1",
    "react": "^16.4.1",
    "react-dom": "^16.4.1",
    "react-router-dom": "^4.3.1",
    "react-scripts": "1.1.4",
    "styled-components": "^3.3.2",
    "styled-reset": "^1.3.5",
    "typography": "^0.16.17"

## 기능

LimCoin 의 Block 과 Transaction 을 볼 수 있다.

`AppContainer` 가 노드에서 데이터를 한 번 받아 오고(`GET /blocks`),
이후에는 WebSocket 으로 새 블록을 받아 화면을 갱신한다.

- 트랜잭션에는 시간 정보가 없으므로, 담고 있는 블록의 timestamp 를 붙여서 보여 준다.
- WebSocket 으로 이미 알고 있는 블록이 되돌아오는 경우가 있어 index 로 중복을 거른다.
- 노드에 붙지 못하면 로딩 상태로 굳지 않고 에러 메시지를 띄운다.

```
src/
  Components/
    App/        데이터 로딩 + 라우팅
    Header/     네비게이션
    Shared/     테이블 셀 등 공용 컴포넌트
  Routes/
    Home/           최근 블록 5개 + 트랜잭션 5개
    Blocks/         블록 15개
    Transactions/   트랜잭션 15개
  constants.js  API / WebSocket 주소
  utils.js      날짜 포맷, WebSocket 메시지 파싱
```

> `NODE_PATH=src` (`.env`) 덕분에 `Components/...` 처럼 절대경로로 import 한다.
