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
    "styled-reset": "^1.3.5"

## 기능

| 경로 | |
|---|---|
| `/` | 요약 통계 + 최근 블록/트랜잭션 |
| `/blocks` | 블록 목록 (페이지네이션) |
| `/transactions` | 트랜잭션 목록 |
| `/block/:hash` | 블록 상세 — 머클 루트, nonce, 담긴 트랜잭션 |
| `/tx/:id` | 트랜잭션 상세 — 입출력, **머클 증명** |
| `/address/:address` | 주소 잔액, 미사용 출력, **트랜잭션 내역** |

목록의 행을 누르면 상세로 간다. 헤더의 검색창에 **블록 높이 · 64자 해시 ·
주소** 중 아무거나 넣으면 노드가 판별해 알맞은 페이지로 보낸다.

트랜잭션 상세에는 백서 8장의 **머클 증명**을 그대로 보여 준다. 블록 전체
대신 log₂(n) 개 해시로 그 트랜잭션이 블록에 담겼음을 확인할 수 있다.

### 데이터 흐름

`AppContainer` 가 목록 한 페이지(`GET /blocks?limit&offset`)와 통계
(`GET /info`), 대기 목록(`GET /transactions`)을 받아 온다. 이후로는
노드에 피어처럼 붙어 WebSocket 으로 흘려 주는 것을 듣는다.

| 노드가 보내는 것 | 언제 | 익스플로러가 하는 일 |
|---|---|---|
| `BLOCKCHAIN_RESPONSE` | 새 블록을 붙였을 때 | 목록에 끼워 넣고 통계·대기 목록을 다시 받는다 |
| `MEMPOOL_RESPONSE` | 트랜잭션을 받았을 때 | 대기 목록을 갈아 끼운다 |

- **통계는 `/info` 에서 받는다.** 예전에는 체인 전체를 받아 프론트에서
  셌는데, 노드가 이제 최신순 한 페이지씩만 준다.
- 첫 페이지를 보고 있을 때만 새 블록을 실시간으로 끼워 넣는다.
  뒤쪽 페이지를 읽는 중에 목록이 밀리면 혼란스럽기 때문이다.
- 이미 알고 있는 블록이 되돌아오는 경우가 있어 index 로 중복을 거른다.
- 노드에 붙지 못하면 로딩 상태로 굳지 않고 이유를 띄운다.

### 소켓이 끊기면

예전에는 소켓이 끊겨도 하는 일이 없었다. 노드를 재시작하거나 잠깐
네트워크가 흔들리면 그 뒤로 화면이 영원히 멈춰 있었고, **새 블록이 오지
않고 있다는 것을 알 방법조차 없었다.**

- 헤더에 연결 상태를 띄운다 (`실시간` / `연결 끊김`)
- 끊기면 다시 붙는다. 노드가 죽어 있는 동안 연결 시도로 도배하지 않도록
  실패할 때마다 간격을 두 배로 늘린다 (1초 → 30초 상한)
- 다시 붙으면 보던 페이지를 다시 받는다. 끊겨 있는 동안 붙은 블록을
  놓쳤을 수 있기 때문이다

### 대기 중인 트랜잭션

아직 블록에 담기지 않은 것(mempool)을 홈과 트랜잭션 목록 위쪽에 따로
보여 준다. 보낸 사람 입장에서 블록이 나올 때까지 아무 흔적도 없으면
보내진 건지 알 수 없다.

수수료는 입력이 가리키는 이전 출력을 되짚어야 알 수 있고 그건 노드만
할 수 있다. 낱개로는 비워 두고 합계만 `/info` 의 `mempoolFees` 로 받는다.

트랜잭션 상세는 대기 중인 것도 열린다(`GET /transactions/:id` 가 mempool
까지 찾아 준다). 담긴 뒤에는 확인 횟수(`confirmations`)를 보여 준다.

```
src/
  Components/
    App/        데이터 로딩 + 라우팅
    Header/     네비게이션 + 검색
    Search/     검색창
    Shared/     표·상세 공용 컴포넌트
    Stats/      요약 타일
    Pending/    대기 중인 트랜잭션
  Routes/
    Home/ Blocks/ Transactions/     목록
    Block/ Transaction/ Address/    상세
  api.js        노드 공개 API 호출
  search.js     검색어 해석
  txinfo.js     블록에서 트랜잭션 파생 (시간, 수수료)
  units.js      LIM 단위 변환
```

> `NODE_PATH=src` (`.env`) 덕분에 `Components/...` 처럼 절대경로로 import 한다.

## 금액 단위와 수수료

노드가 내주는 금액은 전부 최소 단위(lm) 정수다. **1 LIM = 100,000,000 lm**.
화면에서만 LIM 으로 환산한다 (`src/units.js`).

> 주소 내역은 노드가 색인해 둔 것을 그대로 받는다
> (`GET /address/:address/transactions`). 예전에는 이런 게 없어서
> 주소 페이지가 잔액만 보여 줄 수 있었다.

수수료는 트랜잭션에 필드로 들어 있지 않다. 백서 6장대로 "입력합 - 출력합" 의
차액이기 때문이다. 그런데 `txIn` 은 이전 출력을 `(txOutId, txOutIndex)` 로
가리킬 뿐 금액을 갖고 있지 않으므로, 체인 전체의 출력을 색인해 두고 되짚어야
한다 (`src/txinfo.js`).

같은 이유로 **총 발행량은 코인베이스 지급액의 합이 아니다.** 코인베이스는
보조금에 더해 그 블록의 수수료도 가져가는데, 수수료는 이미 유통 중이던
코인이 옮겨 간 것이라 새로 발행된 양이 아니다. 그래서 지급액에서 수수료를
빼고 더한다.

## 디자인

`src/theme.js` 에 토큰이 모여 있다. LimCoin Wallet 과 같은 강조색·반경·그림자
체계를 쓰되, 익스플로러는 웹이므로 라이트를 기본으로 두고 다크는
`prefers-color-scheme` 를 따라간다.

- 해시와 트랜잭션 id 는 고정폭 글꼴 — 자릿수를 눈으로 비교할 수 있어야 한다
- 표는 열 정의를 가진 grid 다. 폭이 좁아지면 Timestamp, Difficulty 순으로 접힌다
- 웹폰트를 받지 않는다. 로컬 노드를 보는 도구가 네트워크에 매달릴 이유가 없다

## 배포 시 주의

`BrowserRouter` 를 쓰므로 정적 호스팅에 올릴 때 **모든 경로를
`index.html` 로 되돌려주는 설정(SPA fallback)이 필요**하다. 이 설정이 없으면
`/blocks` 로 직접 들어갔을 때 404 가 난다. (nginx 의 `try_files`,
Netlify 의 `_redirects`, GitHub Pages 라면 `HashRouter` 로 바꾸는 방법)

## 화면

| 경로 | 무엇 |
|---|---|
| `/` | 최근 블록·트랜잭션, 대기 중인 것 |
| `/blocks` · `/transactions` | 목록 (페이지 나눔) |
| `/block/:hash` · `/height/:n` · `/tx/:id` · `/address/:a` | 상세 |
| `/network` | 피어, 권장 수수료, 이 노드 정보 |
| `/broadcast` | 밖에서 서명한 raw 트랜잭션 제출 (키는 받지 않는다) |
| `/api` | 이 노드의 REST·JSON-RPC 목록 |

P2SH 주소(`M…`/`2…`)는 조건의 해시라 체인만 봐서는 무슨 조건인지 알 수 없다.
주소 화면에서 아는 `redeemScript` 를 붙여 넣으면 노드가 풀어 준다 —
다중서명 몇 개 중 몇 개인지, 언제까지 잠겨 있는지.

## 링크 공유의 한계

화면마다 `<title>` 과 설명이 바뀌므로 탭·북마크·방문 기록은 구분된다.
다만 **카카오톡·트위터 같은 링크 미리보기 봇은 자바스크립트를 돌리지 않아**
`public/index.html` 의 정적 기본값만 본다. 블록·트랜잭션마다 다른 미리보기를
주려면 서버가 화면마다 HTML 을 만들어 내려 줘야 한다(SSR). 지금은 정적 파일을
그대로 내려 주는 구조다.

## 글꼴

본문은 [Pretendard](https://github.com/orioncactus/pretendard)(SIL OFL 1.1)를 쓴다.
`public/fonts/pretendard/` 에 함께 두었다 — CDN 을 쓰지 않는 이유는 로컬 노드를
보는 도구가 바깥 네트워크에 매달릴 이유가 없기 때문이다(지갑은 아예 오프라인에서도
떠야 한다).

동적 서브셋판이라 파일이 92개지만 브라우저는 `unicode-range` 를 보고 화면에
실제로 쓰인 글자가 든 조각만 내려받는다 — 홈 화면 기준 **8개 259KB**
(전부 받는 판은 2MB). 파일을 못 읽어도 `font-display: swap` 과 뒤따르는
시스템 글꼴 목록이 있어 글자는 먼저 보인다.
