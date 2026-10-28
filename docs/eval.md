# LLM 단계 평가 (2026-10-28)

FixGate에서 LLM이 맡는 두 일을 정답이 알려진 사례 6개로 채점했다.

- **실패 원인 설명**: 보안 업그레이드가 기존 테스트를 깨뜨렸을 때, 릴리스 노트(N)·코드 사용처(C)·사용 파일 발췌(S)·실패 테스트(T)·로그(L)만 보고 원인과 선택지를 낸다.
- **조치 경로 선택**: 알려진 취약점이 없는 버전이 메이저 너머에만 있거나 아예 없을 때, 권고(A)·레지스트리(R)·코드(C) 사실만 보고 메이저 업그레이드·교체·보완 통제·위험 수용 중 하나를 고른다. 교체를 고르면 FixGate가 그 패키지를 레지스트리와 OSV에서 다시 확인한다.

## 채점 기준

| 항목 | 통과 조건 |
|---|---|
| 정답 | 원인 설명은 알려진 원인의 핵심어가 있고 '근거 부족'으로 빠지지 않음. 조치 경로는 정답 경로를 고르고, 교체라면 그 패키지가 레지스트리에 있어야 함 |
| 근거 번호 유효 | 근거 번호를 하나 이상 대고, 사실 목록에 없는 번호가 하나도 없음 |
| 위험한 추천 없음 | 추천 선택지가 '위험 높음'(보안을 약하게 하는 우회)이 아니고, 경로가 '위험 수용'이 아님 |

## 사례

| 사례 | 종류 | 실제 원인 / 정답 | 출처 |
|---|---|---|---|
| jwt-rsa-key | 실패 원인 | jsonwebtoken 9.0.0부터 RSA 키 2048비트 이상 요구, 서비스는 1024비트 키 | `examples/shop-api` |
| forge-parseurl | 실패 원인 | node-forge 1.x에 `forge.util.parseUrl`이 없음 | `eval/cases/forge-callback` |
| handlebars-proto | 실패 원인 | handlebars 4.6.0부터 프로토타입 속성(클래스 getter) 접근이 기본 차단 | `eval/cases/handlebars-greeting` |
| xmldom-renamed | 조치 경로 | `xmldom`은 고쳐지지 않고 `@xmldom/xmldom`으로 이어짐 → 교체 | `eval/cases/xmldom-feed` |
| request-deprecated | 조치 경로 | `request`는 폐기돼 고친 버전이 없음 → API가 다른 클라이언트로 교체하거나 그때까지 보완 통제 | `eval/cases/request-client` |
| spring-oss-eol | 조치 경로 | Spring Framework 6.2.x에 공개 수정이 없고 7.0.9부터 고쳐짐 → 메이저 업그레이드 | Netflix/maestro `maestro-server/gradle.lockfile`@5900c44 |

세 테스트 실패 사례는 실제 버전 변경을 그대로 적용해 FixGate의 테스트 관문에서 실제로 실패한 결과를 쓴다.

## 결과

| 모델 | 정답 | 근거 번호 유효 | 위험한 추천 없음 | 비용 |
|---|---|---|---|---|
| OpenAI gpt-6.1-terra (추론 강도 low) | 6 / 6 | 6 / 6 | 6 / 6 | 6회 $0.021 |
| Claude Sonnet (Claude Code 구독) | 6 / 6 | 6 / 6 | 6 / 6 | 구독 |

사례별 답은 `eval/results/`에 있다.

## 평가로 고친 것

첫 평가(Claude, 6개 중 정답 5·근거 유효 3)에서 FixGate 쪽 결함 셋이 드러났다.

1. **네 자리 Maven 버전 비교 오류**: `1.1.10.7`과 `1.1.10.9`를 같은 버전으로 봐서 snappy-java에 "고친 버전 없음"이라고 했다. LLM이 사실 목록 안의 모순(권고는 1.1.10.9에서 고쳐졌다는데 R2는 고친 버전이 없다고 함)을 짚었다. 숫자를 끝까지 비교하도록 고쳤고, OSV의 `group:artifact` 이름도 맞췄다.
2. **근거 번호 읽기**: 모델이 "[A1] 설명…"처럼 문장으로 근거를 대서 번호를 못 읽었다. 문장 안의 번호를 뽑도록 고쳤다.
3. **사실 부족**: handlebars 사례에서 getter가 정의된 줄이 사실에 없어 모델이 판단을 보류했다. 패키지를 쓰는 파일 발췌(최대 2개, 40줄)를 사실에 넣었다.

## 판단 보류 규칙

모델이 스스로 매기는 확신도는 보정이 잘 되지 않는다. 그래서 원인 설명은 관측된 실패(로그 L·테스트 T)와 코드 쪽 사실(코드 C·사용 파일 S·릴리스 노트 N)을 함께 근거로 대야 하고, 아니면 '판단 보류'로 표시한다. 이 규칙을 넣은 뒤에도 두 모델 모두 6/6이었다.

## 다시 돌리기

```bash
FIXGATE_LLM=openai OPENAI_API_KEY=... node scripts/eval.ts
FIXGATE_LLM=claude-code node scripts/eval.ts
```

OpenAI 호출은 토큰 사용량으로 비용을 계산해 `.fixgate-cache/llm/spend.json`에 쌓고, `FIXGATE_LLM_BUDGET_USD`(기본 $0.6)에 닿으면 멈춘다. 이번 평가·비교 실험·예제 보고서 전체에 쓴 비용은 $0.21이다.
