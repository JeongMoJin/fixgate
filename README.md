# FixGate

SBOM 취약점 경보를 **근거가 붙은 처리 순서**로 바꾸고, **검증 관문을 통과한 조치만** 완료로 치는 에이전트.

An agent that turns SBOM vulnerability alerts into a fix order with sourced reasons, and counts a fix as done only after the tests and a fresh scan pass.

## 왜 필요한가

- 2025년 한 해 공개된 CVE는 48,185건으로 전년보다 20.6% 늘었다 ([Jerry Gamblin](https://jerrygamblin.com/2026/01/01/2025-cve-data-review/)).
- 그중 실제 공격에 쓰인 기록이 있는 것은 공개 CVE의 약 6%다 ([Cyentia·FIRST](https://www.cyentia.com/epss/)).
- 스캐너는 심각도 순 목록을 준다. 무엇부터 고칠지, 고친 뒤 정말 해결됐는지는 사람이 한 건씩 확인한다.

## 흐름

```mermaid
flowchart LR
  A[SBOM<br>CycloneDX] --> B[OSV 매칭]
  B --> C[위협: KEV · EPSS<br>영향: 노출 · 운영 여부 · 실제 import<br>조치: 고친 버전]
  C --> D[4단계<br>즉시 · 이번 주 · 계획 · 영향 없음]
  D --> E[조치 계획<br>가장 작은 안전한 버전]
  E --> F[작업 사본에 적용]
  F --> G{관문 4개<br>설치 · 기존 테스트<br>재스캔 · 새 취약점 없음}
  G -- 통과 --> H[조치 완료<br>package.json diff]
  G -- 재스캔 실패 --> E
  G -- 테스트 실패 --> I[사람 검토<br>테스트 기록 + 릴리스 노트]
```

## 예제 결과 — `examples/shop-api`

라이브러리 4개(express, axios, jsonwebtoken, lodash)를 오래된 버전으로 쓰는 예제 서비스다. 인터넷 노출, 개인정보 처리로 설정했다. 2026-10-28 실행 결과:

| | 조치 전 | 조치 후 |
|---|---|---|
| 경보 | 67건 (구성요소 149개 중 15개) | 22건 |
| 즉시 · 이번 주 | 20건 | 1건 |
| 운영 영향 없음 (개발 전용) | 19건 | 19건 — VEX 제안으로 기록 |

- **axios** 0.21.1 → 0.34.0, **lodash** 4.17.20 → 4.18.1: 관문 4개 통과.
- **express** 4.17.1 → 4.20.0: 자기 취약점은 사라졌지만 '새 취약점 없음' 관문에서 막혔다 (qs가 새 권고에 걸림). 에이전트가 다음 후보 4.22.3을 시도해 통과.
- **jsonwebtoken** 8.5.1 → 9.0.0: 기존 테스트가 실패해 되돌리고 사람에게 넘김. 릴리스 노트에서 원인을 찾아 함께 넘긴다: "RSA key size must be 2048 bits or greater." 이 서비스는 1024비트 키를 쓴다. 키 교체는 사람이 정할 일이다.
  LLM 단계를 켜면 릴리스 노트·코드·테스트·로그 줄에 번호를 붙여 주고, 그 번호만 근거로 원인과 선택지를 받는다. 이번 답: "9.0.0부터 RSA 키는 2048비트 이상이어야 하고 [N6] 테스트는 1024비트 키를 쓴다 [T9] … 실제 오류 메시지는 로그에 없어 확정은 아니다." 추천은 키 교체(위험 낮음), 8.5.1 유지나 우회는 위험 높음으로 표시했다.

전체 보고서: [docs/sample-report.html](docs/sample-report.html) · [docs/sample-report.md](docs/sample-report.md)

## Java 서비스 5개 측정

DataHub, Netflix Maestro 등 Gradle lockfile을 커밋하는 Java 서비스 5개(구성요소 1,856개): 경보 107건 중 이번 주 안에 볼 것 34건(패키지 15개), 15개 모두 알려진 취약점이 없는 버전으로 고정할 수 있었다. Maestro의 Spring Framework 6.2.19는 CRITICAL 2건이 7.0.9에서만 고쳐져 '메이저 업그레이드' 경로로 넘겼다 ([docs/sample-java-report.md](docs/sample-java-report.md)).

## 공개 프로젝트 9개 측정

jitsi-meet, insomnia, bitwarden clients, node-red 등 npm lockfile을 커밋하는 공개 프로젝트 9개(구성요소 12,553개)에 `scan`을 돌렸다 (2026-10-28, 모두 인터넷 노출로 가정).

- 이번 주 안에 볼 경보(즉시·이번 주)가 923건에서 219건으로 76% 줄고, 패키지로 묶으면 102개 조치.
- 467건(50.6%)은 개발·테스트 전용이라 운영에 들어가지 않는다 → '운영 영향 없음' 제안(승인 전 미확정). 악성 패키지는 개발 전용이어도 '즉시'.
- git에서 받는 내부 패키지와 같은 이름의 악성 패키지가 npm에 있는 **의존성 혼동 위험** 3건을 찾았다.

저장소별 숫자와 다시 돌리는 방법은 [docs/benchmark.md](docs/benchmark.md).

## LLM은 어디에 쓰나

사실 판단(취약 여부, 버전, 점수)에는 쓰지 않는다. 같은 질문을 도구 없이 LLM에게만 했더니(서비스 10개, 운영 패키지 440개) 두 모델 모두 같은 모양이었다:

| | Claude Sonnet | OpenAI gpt-6.1-terra | FixGate |
|---|---|---|---|
| 2025년 이전 공개 권고 중 짚은 것 | 69% (20/29) | 66% (19/29) | OSV 그대로 |
| 2025년 이후 공개 권고 중 짚은 것 | 10% (10/99) | 12% (12/99) | OSV 그대로 |
| 제안한 업그레이드 버전에 알려진 취약점이 없음 | 44% (7/16) | 50% (2/4) | 후보마다 OSV 확인 |

모델의 지식은 학습 시점에 멈추고 취약점은 매일 나온다. 측정 방법은 [docs/llm-vs-tools.md](docs/llm-vs-tools.md).

그래서 LLM은 열린 판단 두 가지에만 쓴다.

1. **실패 원인 설명**: 업그레이드가 기존 테스트를 깨뜨리면 릴리스 노트(N), 코드 사용처(C), 사용 파일 발췌(S), 실패 테스트(T), 로그(L)에 번호를 붙여 주고 원인과 선택지를 받는다.
2. **조치 경로 선택**: 알려진 취약점이 없는 버전이 메이저 너머에만 있거나 아예 없으면 권고(A)·레지스트리(R)·코드(C) 사실로 메이저 업그레이드·교체·보완 통제·위험 수용 중 하나를 고른다. 교체를 고르면 그 패키지를 레지스트리와 OSV에서 다시 확인한다.

두 경우 모두 JSON 스키마로 답을 받고, 사실 목록에 없는 근거 번호는 버린다. 원인 설명은 관측된 실패(로그·테스트)와 코드 쪽 사실(코드·사용 파일·릴리스 노트)을 함께 근거로 대지 못하면 모델의 확신도와 관계없이 '판단 보류'로 표시한다. 정답이 알려진 6개 사례 평가에서 두 모델 모두 정답·근거 번호 유효·위험한 추천 없음이 6/6이었다 ([docs/eval.md](docs/eval.md)).

```bash
FIXGATE_LLM=openai OPENAI_API_KEY=... node src/cli.ts fix examples/shop-api
FIXGATE_LLM=claude-code node src/cli.ts scan <Java 서비스> --plan
```

- `openai`: Responses API + Structured Outputs. 기본 모델 `gpt-6.1-terra`, 추론 강도 `low`. 호출마다 토큰 사용량으로 비용을 계산해 `.fixgate-cache/llm/spend.json`에 쌓고, `FIXGATE_LLM_BUDGET_USD`(기본 $0.6)에 닿으면 더 부르지 않는다. 평가·비교 실험·예제 보고서 전체에 든 비용은 $0.21이었다.
- `claude-code`: Claude Code CLI의 headless 모드(`claude -p`)로, 로그인한 구독으로 동작한다. 도구는 끄고 빈 작업 폴더에서 부른다.
- 답은 `.fixgate-cache/llm/`에 남아 같은 질문은 다시 호출하지 않고, 한 번 실행의 호출 수는 `FIXGATE_LLM_MAX_CALLS`(기본 10)로 막는다. LLM을 끄면 결정적 단계와 보고서는 그대로 동작한다.

## 원칙

1. **사실은 도구가 가져온다.** 버전, 권고, 악용 확률은 모두 공개 DB에서 오고, 보고서의 모든 근거에 출처가 붙는다.
2. **관문을 통과하기 전에는 완료가 아니다.** 설치, 기존 테스트, 재스캔, 새 취약점 없음. 테스트가 없는 서비스는 검증할 수 없으므로 조치를 완료로 치지 않는다. ([ai-agent-guardrails](https://github.com/JeongMoJin/ai-agent-guardrails)와 같은 규칙)
3. **원본은 건드리지 않는다.** 조치는 임시 작업 사본에서만 시도하고, 패키지 설치 스크립트는 실행하지 않는다(`--ignore-scripts`).
4. **결정은 사람이 한다.** '영향 없음'은 VEX 제안으로만 남기고, 변경 반영은 담당자가 승인한다.

## 사용법

Node.js 24 이상. TypeScript를 빌드 없이 바로 실행한다.

```bash
npm install
node src/cli.ts scan examples/shop-api      # 읽기만: 처리 순서 보고서
node src/cli.ts fix examples/shop-api       # 작업 사본에서 조치 + 관문 검증
node src/cli.ts scan <폴더> --sbom bom.json  # 다른 도구가 만든 CycloneDX·SPDX SBOM 사용
node src/cli.ts scan <Java 서비스> --plan    # gradle.lockfile → 패키지별 버전 고정 계획
```

입력은 서비스 폴더에서 `bom.json`·`sbom.cdx.json`(CycloneDX), `sbom.spdx.json`(SPDX, GitHub dependency graph 내보내기 포함), `gradle.lockfile`, `package-lock.json` 순서로 찾는다.

결과는 `fixgate-out/<서비스>/`에 남는다: `report.html`, `report.md`, `vex.json`, `findings.json`, 조치 후 `package.json`·`package-lock.json`.

서비스 맥락은 서비스 폴더의 `fixgate.json`에 적는다. 없으면 인터넷 노출·중요도 medium으로 본다.

```json
{ "service": "shop-api", "exposure": "internet", "criticality": "high", "personalData": true, "owner": "커머스 개발팀" }
```

## 우선순위 규칙

CISA [SSVC](https://www.cisa.gov/stakeholder-specific-vulnerability-categorization-ssvc)의 순서(악용 → 노출 → 영향)를 따른다.

| 조건 | 단계 |
|---|---|
| 악성 패키지 (OSV `MAL-`) | 즉시 — 개발 전용이어도 |
| 레지스트리 밖(git) 패키지와 같은 이름의 악성 패키지 | 이번 주(운영) / 계획(개발) — 의존성 혼동 |
| 개발·테스트 전용 의존성 | 운영 영향 없음 (VEX 제안, 빌드 환경 위험은 별도). 번들 프론트엔드(`fixgate.json`의 `bundled: true`)는 개발 의존성도 결과물에 들어갈 수 있어 운영으로 본다 |
| CISA KEV 등재 | 즉시 |
| EPSS 10% 이상 또는 상위 5% | 인터넷 노출이면 즉시, 내부면 이번 주 |
| 심각도 HIGH · CRITICAL | 인터넷 노출이거나 중요 서비스면 이번 주, 아니면 계획 |
| 그 밖 | 계획 |

## 한계

- 조치 적용과 관문 검증(fix)은 지금 npm 프로젝트만 한다. Java(Maven·Gradle)는 매칭·우선순위·버전 고정 계획(scan --plan)까지 한다. 매칭과 우선순위는 CycloneDX·SPDX SBOM이면 생태계와 관계없이 동작한다.
- Gradle lockfile에는 의존 관계 그래프가 없어 직접·간접을 구분하지 않는다.
- '실제 사용'은 패키지 단위 import 검색이다. 취약한 함수까지 따라가는 도달성 분석은 아니다.
- 단계 임계값(EPSS 10%, 상위 5%)은 조직 정책에 맞게 조정해야 한다.
- LLM 공급자는 `src/llm.ts` 한 파일에서 바꾼다 (지금 OpenAI Responses API와 Claude Code CLI).

## 데이터 출처

[OSV](https://osv.dev) · [FIRST EPSS](https://www.first.org/epss/) · [CISA KEV](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) · npm registry. 응답은 `.fixgate-cache/`에 하루 동안 보관해 같은 사실로 다시 돌릴 수 있다.

## License

MIT
