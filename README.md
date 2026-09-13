# 내 집 마련 예상 비용 계산기

현재 무주택자가 서울 아파트를 매수해 1주택자가 되는 경우의 취득 관련 세금, 중개보수 상한, 등기비용과 잔금일 필요 현금을 계산하는 정적 웹 MVP입니다.

## 브라우저 미리보기

프로덕션 빌드를 실제 브라우저에서 확인하려면 아래 명령을 실행하세요.

```bash
npm run preview
```

실행 후 브라우저에서 **[http://localhost:4173](http://localhost:4173)** 을 열면 됩니다. 원격 개발 환경에서는 포트 `4173`을 공개한 뒤 해당 환경이 제공하는 전달 URL을 여세요. 미리보기 서버는 모든 네트워크 인터페이스(`0.0.0.0`)에서 접속을 허용합니다.

소스 파일을 바로 확인하며 수정할 때는 다음 명령을 사용할 수 있습니다.

```bash
npm run dev
```

로그인, 데이터베이스 또는 서버 애플리케이션 없이 브라우저에서만 계산합니다.

## GitHub Pages 공개 링크

`main` 브랜치에 push하면 `.github/workflows/deploy-pages.yml`이 정적 빌드를 GitHub Pages에 자동 배포합니다. 저장소의 **Settings → Pages → Build and deployment → Source**가 `GitHub Actions`로 설정되어 있으면 아래 형태의 공개 링크가 만들어집니다.

```text
https://<GitHub 사용자 또는 조직>.github.io/<저장소 이름>/
```

HTML의 CSS·JavaScript 경로는 하위 경로에서도 작동하도록 상대 경로로 구성되어 있습니다.

## 검증

```bash
npm test
npm run build
```

테스트에는 요청된 대표 가격 6건, 중개보수·생애최초 감면·대출 인지세 경계값과 기지급금 사례가 포함되어 있습니다.
