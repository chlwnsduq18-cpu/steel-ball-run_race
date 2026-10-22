# 스틸 볼 런 — 나의 레이스

HTML/CSS/JavaScript로 만든 싱글 플레이 카드 게임입니다.

## 실행

Node.js 22 이상에서 다음 명령을 실행합니다. 외부 npm 패키지 설치는 필요하지 않습니다.

```sh
npm run build
npm run dev
```

브라우저에서 http://localhost:4173 에 접속합니다.
별도의 서버 없이 실행하려면 `dist/sbr-race.html`을 브라우저로 엽니다.

## 검증

```sh
npm test
```

## 배포

`npm run build` 완료 후 `dist/`의 내용을 정적 호스팅에 배포합니다.
`dist/`에는 직접 관리하는 코드도 포함되어 있으므로 빌드 전에 폴더를 삭제하지 않습니다.
게임 저장 기록은 접속한 사이트 주소별 브라우저 저장소에 보관됩니다.
