English: [README_EN.md](README_EN.md) · [itch.io release notes](ITCH_PAGE_EN.md)

# 미결 — 진술실 04

참고인의 진술 속 빈틈을 파고들어 숨겨진 진실을 찾는 한국어 웹 추리 게임입니다. 증언을 추궁하고 증거로 모순을 반박해 네 겹의 진실을 밝혀내세요. 별도의 사물 맞히기 모드도 제공합니다.

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

## 모드 1 — 겹겹의 진실

세 사건마다 **네 겹의 의도적인 거짓말**이 있습니다. 한 번의 정답 선택으로 끝나지 않습니다.

1. 현재 증언의 문장을 **추궁**해 추가 진술과 문서를 얻습니다.
2. **확보한 증거**를 읽고 어느 문장과 모순되는지 판단합니다.
3. 그 문장의 **증거 제시**를 눌러 문서를 제출합니다.
4. 모순이 입증되면 증인이 일부를 시인하고 **새 거짓말이 섞인 증언**을 합니다.
5. 네 번 입증하면 0 → 25 → 50 → 75 → 100%로 올라가며 전체 진실이 열립니다.

현재 증언의 진실·거짓과 증거 연결은 작성된 사건 설정에 고정됩니다. 자유 AI 대화는 변명과 회피를 생성하지만 증거 획득, 진행도, 정답을 변경하지 않습니다. AI가 사실을 잘못 말하는 경우에도 기준은 상단 증언과 증거 문서입니다. 이후 단계의 비밀은 AI 프롬프트와 브라우저에 미리 전달하지 않습니다.

**극장 사건 예:** 알리바이 → 원본 교체 → 숨겨 둔 장소 → 함께 계획한 사람. 각 단계에서 이전의 시인을 발판으로 더 깊은 거짓말을 반박합니다. 원작 게임의 캐릭터·음악·대사는 사용하지 않습니다.

## 모드 2 — 기억 속 사물

준비된 12개 사물 중 서버가 하나를 무작위 선택합니다. 한 판 동안 정답은 바뀌지 않습니다. 질문의 응답은 다음 네 가지로 제한합니다.

- 맞다
- 아니다
- 그랬던 것 같다
- 기억이 나지 않는다

확정된 기본 특징은 서버가 판정하고, 기타 자유 질문은 선택한 AI가 해석합니다. 형식을 벗어난 답변은 노출하지 않습니다. 같은 질문을 반복하면 첫 답변을 유지합니다. 데모에서 해석하지 못하는 질문은 기억이 나지 않는다로 답합니다. 구체적인 물건의 성질을 기준으로 하며, 같은 종류의 모든 물건을 뜻하지는 않습니다.

별도 **정답 제출**에 이름 하나를 입력하면 맞혔는지 확인합니다. 일부 별칭을 지원하며 여러 후보를 나열하는 답은 인정하지 않습니다. 사물 모드에는 진실을 밝혀낸 비율을 가장한 임의의 진행도를 표시하지 않고 질문·제출 횟수를 표시합니다.

두 모드의 세션은 따로 유지되어 탭을 바꾸어도 이어 할 수 있습니다. 각 모드에서 질문은 판당 60회까지이며, 이후에도 증거 제시와 정답 제출은 가능합니다.

## AI 연결 범위

사건과 사물 후보는 작성된 고정 데이터입니다. AI가 새로운 사건을 무한 생성하는 기능은 없습니다. 자유 대화는 Raon 실제 키로 확인했으며 다른 제공자는 요청/응답 모의 테스트 상태입니다. 사용자는 AI가 임의로 한 말을 정답이나 확정 증거로 취급할 필요가 없습니다. 인증 오류, 한도 초과, 타임아웃은 화면에 알리고 작성된 진술 또는 불확실 응답으로 이어갑니다.

## 디자인

[Noir Detetive DESIGN.md](https://designmd.app/library/noir-detetive/)의 색상·명암·수평 구획을 참고하고 게임용으로 재해석했습니다. 프로젝트 규칙과 차이는 [DESIGN.md](DESIGN.md)에 기록했습니다. 진술실 SVG는 프로젝트 자체 제작 이미지입니다.

## 로컬 저장과 배포 범위

세션은 서버 메모리에 임시 보관되며 2시간 미사용 또는 서버 종료 시 삭제됩니다. 브라우저에는 세션 ID만 보관합니다. `.env`는 `.gitignore`로 제외됩니다. ZIP 배포는 추적된 소스 파일만 포함합니다.

이 버전은 **127.0.0.1 전용 로컬 앱**입니다. GitHub Pages에서는 Node 서버를 실행할 수 없으므로 다운로드하여 PC에서 실행하세요. 인터넷에 공개하는 공용 서버는 별도 인증과 요청 제한을 갖추어야 합니다.

## 검증 / 백업

```sh
npm test
```

단계 순서, 증거 잠금, 오답·중복 방지, 미래 비밀 비공개, 두 모드 분리, 사물 답변 제한, 정답 판정, 100% 완료, 세션 복원, 새 판 전환을 검사합니다.

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

## English / itch.io (0.2.1)

- English edition: http://127.0.0.1:4173/en/ (language switch in the header).
- `npm run package:itch` builds `dist/unfiled-0.2.2-local.zip`, without API keys.
- Upload as a downloadable project, not an HTML5 embed. Node.js 22.9+ is required.
- English page copy and upload steps: `ITCH_PAGE_EN.md`. Launch instructions: `START_HERE.txt`.
- Regenerate English interface assets with `npm run build:locales` after editing UI translations.

## 0.2.1 — 대화 중심 도입

사건을 맡게 된 배경 → 도착 장면 → 첫 인사 → 당시 이야기 순으로 진행합니다. 따로 나열하던 진술 목록은 없애고 대화 속 문장을 선택할 때만 더 묻기와 증거 대조가 나타납니다. 세 사건의 네 단계 모두 한국어·영어 연결 대사를 추가했습니다.
