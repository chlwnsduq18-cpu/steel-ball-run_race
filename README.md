# 스틸 볼 런 — 나의 레이스

HTML/CSS/JavaScript로 만든 싱글 플레이 카드 게임입니다.

## 실행

Node.js 22 이상에서 다음 명령을 실행합니다. 외부 npm 패키지 설치는 필요하지 않습니다.

```sh
npm run build
npm run dev
```

브라우저에서 http://localhost:4173 에 접속합니다.
별도의 서버 없이 실행하려면 `sbr-race.html`을 브라우저로 엽니다.

## 검증

```sh
npm test
```

## 배포

GitHub Pages에서 **Settings → Pages → Deploy from a branch → main → /(root)**를 선택합니다.
저장소 루트의 `index.html`이 시작 페이지이며, `src/`, `style.css`, `game-data.json`, `runtime-base.json`을 함께 사용합니다.
소스나 데이터 수정 후 `npm run build`를 실행하고 생성된 파일을 함께 커밋합니다.
GitHub Free는 공개 저장소에서 Pages를 지원하며, 개인 비공개 저장소에는 GitHub Pro가 필요합니다.
게임 저장 기록은 접속한 사이트 주소별 브라우저 저장소에 보관됩니다.
