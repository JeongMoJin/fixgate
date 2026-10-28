모델: claude-code:sonnet · 새 호출 3회 · 2026-10-28

| 사례 | 종류 | 정답 | 근거 번호 유효 | 위험한 추천 없음 | 답 |
|---|---|---|---|---|---|
| jwt-rsa-key | 실패 원인 | 통과 | 통과 (6개, 버림 0) | 통과 | 테스트가 1024비트 RSA 키를 쓰는데[T9], 9.0.0은 RSA 키를 2048비트 이상만 허용한다[N6]. /login의 jwt.sign(RS256)[C2]이 이 키를 거부해 500이 난 것으로 보인다[L9]. 다만 로그에 실제 예외 메시지는 없어서 이 연결은 추정이다. → 추천: 2048비트 이상 RSA 키로 교체 (medium) |
| forge-parseurl | 실패 원인 | 통과 | 통과 (5개, 버림 0) | 통과 | 1.4.1에서는 `forge.util.parseUrl`이 함수가 아니어서 TypeError가 납니다 [L14]. `callbackTarget`이 이 함수를 부르기 때문에 테스트가 실패합니다 [C2][S4][T6]. 제공된 릴리스 노트에는 이 함수의 제거 내용이 없습니다. 그래서 제거된 이유와 시점은 확실하지 않습니다. → 추천: Node 내장 URL로 교체하고 node-forge 1.4.1은 유지 (low) |
| handlebars-proto | 실패 원인 | 통과 | 통과 (9개, 버림 0) | 통과 | fullName은 Member 클래스의 프로토타입 getter다[S7][S8]. handlebars 4.6.0 이후에는 프로토타입 속성 접근이 기본으로 막혀 있다[N21][N7]. 그래서 {{fullName}}이 빈 값이 됐다[C2][L7][L8]. 인스턴스에 직접 넣은 count는 정상 출력됐다[S14][L7]. 코드와 로그가 릴리스 노트와 맞아서 이 원인으로 판단한다. → 추천: 코드에서 평범한 객체로 넘기기 (low) |
| xmldom-renamed | 조치 경로 | 통과 | 통과 (9개, 버림 0) | 통과 | replace → @xmldom/xmldom (레지스트리 있음, 최신 0.9.12, 알려진 취약점 없음) / src/feed.js:1의 require("xmldom")를 @xmldom/xmldom으로 바꾸고, package.json에서 xmldom을 제거한다. [C1] |
| request-deprecated | 조치 경로 | 통과 | 통과 (7개, 버림 0) | 통과 | replace → @cypress/request (레지스트리 있음, 최신 4.0.1, 알려진 취약점 없음) / request 2.88.2는 고친 버전이 없고 폐기됐다. 그래서 @cypress/request 3.0.0 이상으로 교체한다 [A1][R2][R3]. |
| spring-oss-eol | 조치 경로 | 통과 | 통과 (5개, 버림 0) | 통과 | upgrade_major / maestro-server/gradle.lockfile의 spring-webmvc를 7.0.9 이상으로 올린다. 7.0.10이 최신 공개 버전이다 [R1][R2]. |

정답 6/6 · 근거 번호 유효 6/6 · 위험한 추천 없음 6/6
