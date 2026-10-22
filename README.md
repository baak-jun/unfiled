# 미결 — 진술실 04

참고인의 진술 속 빈틈을 파고들어 숨겨진 진실을 찾는 한국어 웹 추리 게임입니다. 질문을 통해 **행동 · 증거의 위치 · 은폐 이유**를 밝혀내세요.

## 내 API 키로 바로 실행

필요한 프로그램: [Node.js 22.9 이상](https://nodejs.org/) (24 LTS 권장). npm 패키지 설치는 필요 없습니다.

### Windows

1. GitHub의 **Code → Download ZIP**을 선택하고 압축을 풉니다.
2. [Raon 콘솔](https://raon-console.krafton.ai)에 본인 계정으로 로그인하고 API 키를 발급합니다. 다른 AI 제공자의 키도 아래 방법으로 사용할 수 있습니다.
3. **setup-key.cmd**를 더블클릭하고 제공자 번호, 모델 ID, 해당 제공자의 키를 입력합니다. 키 문자는 화면에 표시되지 않습니다.
4. **start.cmd**를 더블클릭합니다. 실행 창을 열어 둡니다.
5. [http://127.0.0.1:4173](http://127.0.0.1:4173)을 브라우저로 엽니다.

키 없이 `start.cmd`만 실행하면 정해진 답변으로 플레이하는 데모가 시작됩니다.

### macOS / Linux / 직접 설정

프로젝트 최상위에 `.env.example`을 복사해 `.env`를 만듭니다. 텍스트 편집기에서 자기 키를 입력합니다.

```dotenv
AI_PROVIDER=raon
AI_MODEL=raon-1-mini-preview
AI_API_KEY=여기에_본인의_키
PORT=4173
```

```sh
npm start
```

`.env`는 `server.mjs`와 같은 폴더에 둡니다. 키를 바꾼 뒤에는 기존 서버를 Ctrl+C로 종료하고 다시 실행합니다. 시스템 환경 변수에 같은 이름이 이미 있으면 그 값이 `.env`보다 우선합니다.

## 키 만료와 무료 프리뷰 종료

개발자의 키는 배포물에 포함되지 않습니다. 모든 사용자는 자신의 `.env`를 만들어 독립적으로 실행합니다. 키가 거부되면 게임에서 안내하며 해당 답변을 데모로 대체합니다. `setup-key.cmd`를 다시 실행해 새 키를 설정하세요.

**키 만료와 서비스의 무료 기간 종료는 다릅니다.** 새 키가 무료 이용을 보장하지 않습니다. 2026-10-22 확인한 [Raon 공식 요금 문서](https://raon-mini.krafton.ai/ko/docs/usage)는 이번 프리뷰 모델 이용료가 0원이라고 안내합니다. 이후 요금과 제한은 공식 콘솔에서 확인하세요.

키는 로컬 파일에 평문으로 저장되며 서버에서만 읽습니다. 브라우저, GitHub, 소스 ZIP, 백업에는 포함하지 않습니다. AI 모드에서는 입력한 질문과 최근 진술 일부를 선택한 AI 제공자로 전송합니다. 키를 채팅창이나 스크린샷으로 공유하지 마세요.

## 플레이

- **신문:** 직접 질문하거나 행동 / 장소 / 이유 추천 질문을 선택합니다.
- **추리:** 기록판의 미확인 조각을 열고 가설을 제출합니다.
- **진행도:** 사실 하나를 맞힐 때마다 33% → 67% → 100%로 올라갑니다.
- **해결:** 세 사실이 확인되면 사건 전말과 증거 연결이 열립니다.
- 힌트 3회, 오답 재시도, 새로고침 복원, 새 사건 전환을 지원합니다.

## 현재 범위

세 사건(마지막 상영 / 사라진 11분 / 닫힌 문 뒤에서)은 직접 작성된 고정 시나리오입니다. 서버가 무작위로 사건을 선택합니다. 선택한 AI는 참고인의 자유 대화만 생성하며 사건 정답이나 진행도를 변경하지 않습니다. **AI가 무한히 새 사건을 만드는 기능은 아직 없습니다.**

정답 판정은 선택지 방식입니다. 자유 입력 추리를 의미 분석해 채점하는 기능은 아직 없습니다. 의료·상담 게임이 아닙니다.

`raon-1-mini-preview` / `https://raon-api.krafton.ai/v1/chat/completions`를 [공식 문서](https://raon-mini.krafton.ai/ko/docs/chat-completions)에 맞춰 사용합니다. Raon은 실제 키로 자유 질문 응답을 확인했습니다. 다른 제공자는 요청·응답 형식을 모의 테스트했으며 실제 키 검증은 하지 않았습니다. 인증 실패, 한도 초과, 타임아웃은 데모 전환 안내로 처리합니다.

## 디자인

[Noir Detetive DESIGN.md](https://designmd.app/library/noir-detetive/)의 색상·명암·수평 구획을 참고하고 게임용으로 재해석했습니다. 프로젝트 규칙과 차이는 [DESIGN.md](DESIGN.md)에 기록했습니다. 진술실 SVG는 프로젝트 자체 제작 이미지입니다.

## 로컬 저장과 배포 범위

세션은 서버 메모리에 임시 보관되며 2시간 미사용 또는 서버 종료 시 삭제됩니다. 브라우저에는 세션 ID만 보관합니다. `.env`는 `.gitignore`로 제외됩니다. ZIP 배포는 추적된 소스 파일만 포함합니다.

이 버전은 **127.0.0.1 전용 로컬 앱**입니다. GitHub Pages에서는 Node 서버를 실행할 수 없으므로 다운로드하여 PC에서 실행하세요. 인터넷에 공개하는 공용 서버는 별도 인증과 요청 제한을 갖추어야 합니다.

## 검증 / 백업

```sh
npm test
```

판정, 오답·중복 방지, 정답 비공개, 힌트 소진, 100% 완료, 세션 복원, 새 사건 전환을 검사합니다.

PowerShell에서 `./backup.ps1`을 실행하면 `backups/`에 키를 제외한 ZIP을 저장합니다. 백업은 별도 폴더에 풀어 복원하며 기존 파일을 자동 덮어쓰지 않습니다.

## 다른 AI 키 사용

`setup-key.cmd`에서 제공자를 선택하세요. **키만 바꾸지 말고 제공자와 모델도 함께 바꿔야 합니다.** 기존 `RAON_API_KEY`는 유지하며 다른 제공자에게 자동 전달하지 않습니다. 공통 `AI_API_KEY`를 넣으면 선택한 제공자의 키로 사용합니다.

| AI_PROVIDER | API 형식 | 자동 설정 주소 | 대체 키 환경 변수 |
| --- | --- | --- | --- |
| raon | Chat Completions | https://raon-api.krafton.ai/v1 | RAON_API_KEY |
| openai | Chat Completions | https://api.openai.com/v1 | OPENAI_API_KEY |
| gemini | OpenAI 호환 | https://generativelanguage.googleapis.com/v1beta/openai | GEMINI_API_KEY |
| anthropic | Claude Messages | https://api.anthropic.com/v1 | ANTHROPIC_API_KEY |
| deepseek | Chat Completions | https://api.deepseek.com | DEEPSEEK_API_KEY |
| custom | OpenAI 호환 | AI_BASE_URL 직접 입력 | AI_API_KEY |

Raon 외 제공자는 콘솔에서 사용할 수 있는 **텍스트/채팅 모델 ID를 AI_MODEL에 반드시 입력**합니다. 모델 이름이나 사용 권한이 바뀌더라도 소스를 수정할 필요가 없습니다. OpenAI에서는 Chat Completions를 지원하는 모델을 선택하세요. Responses 전용 모델은 이 어댑터에서 지원하지 않습니다. Azure 등 별도 인증·파라미터 규격은 custom만으로 지원되지 않을 수 있습니다.

사용자 지정 API는 HTTPS 또는 localhost HTTP 주소만 허용합니다. Base URL에는 `/v1` 등 버전 경로까지 넣되 `/chat/completions`는 붙이지 않습니다. 임의의 외부 주소를 설정하면 키와 대화가 그 주소로 전송되므로 자신이 사용하는 제공자의 주소를 입력하세요. 인증 없는 로컬 호환 서버에서는 임시 문자열을 AI_API_KEY로 설정할 수 있습니다.

`AI_MAX_TOKENS`는 128~8192 사이이며 기본 2048입니다. 추론이 많은 모델에서 응답이 비면 늘릴 수 있습니다. 요청 타임아웃은 35초이고 자동 재시도는 하지 않습니다. 각 AI의 이용료·무료 한도는 별도입니다. 이 프로그램이 다른 AI까지 무료로 만들어 주지는 않습니다.

공식 구현 근거 (2026-10-22 확인): [OpenAI Chat Completions](https://developers.openai.com/api/reference/resources/chat/subresources/completions/methods/create), [Gemini 호환 API](https://ai.google.dev/gemini-api/docs/openai/), [Claude Messages](https://platform.claude.com/docs/en/api/messages/create), [DeepSeek](https://api-docs.deepseek.com/).
