모델: claude-code:sonnet · 새 호출 4회 · 2026-10-28

| 사례 | 종류 | 정답 | 근거 번호 유효 | 위험한 추천 없음 | 답 |
|---|---|---|---|---|---|
| jwt-rsa-key | 실패 원인 | 통과 | 통과 (7개, 버림 0) | 통과 | 9.0.0부터 RSA 키는 2048비트 이상이어야 한다[N6]. 테스트는 1024비트 키 쌍을 만든다[T8][T9]. /login은 이 키로 RS256 서명을 한다[C2]. 그래서 서명 단계에서 예외가 나고 500이 반환된 것으로 보인다[L9]. 다만 로그에 실제 오류 메시지는 없어서, 이 연결은 코드와 릴리스 노트로 추정한 것이다. → 추천: 2048비트 이상 RSA 키로 교체 후 9.0.0 적용 (low) |
| forge-parseurl | 실패 원인 | 통과 | 통과 (4개, 버림 0) | 통과 | src/callback.js가 호출하는 forge.util.parseUrl이 1.4.1에는 함수로 없어서 TypeError가 났다 [L14][C2]. 주어진 릴리스 노트 발췌에는 이 API가 제거됐다는 말이 없다. 그래서 제거 경위는 불확실하지만, 오류 자체는 로그와 코드로 확인된다 [N1]. → 추천: parseUrl 호출을 Node 내장 URL로 교체하고 1.4.1 유지 (medium) |
| handlebars-proto | 실패 원인 | 통과 | 통과 (7개, 버림 0) | 통과 | `fullName`은 Member 클래스의 getter라서 프로토타입에 있는 속성이다 [S7][S2]. 템플릿이 이 속성을 읽는데 [C2], handlebars 4.6.0부터 프로토타입 속성 접근이 기본적으로 막혀 있다 [N20][N21]. 그래서 `fullName`이 빈 값으로 렌더링됐다 [L7][L8]. 인스턴스에 직접 붙인 `count`는 정상 출력됐다 [L7][S14]. → 추천: 템플릿에 일반 객체를 넘기기 (권장) (low) |
| xmldom-renamed | 조치 경로 | 통과 | 통과 (9개, 버림 0) | 통과 | replace → @xmldom/xmldom (레지스트리 있음, 최신 0.9.12, 알려진 취약점 없음) / src/feed.js:1의 require("xmldom")를 @xmldom/xmldom으로 바꾸고, package.json에서 xmldom을 제거한다. [C1] |
| request-deprecated | 조치 경로 | 통과 | 통과 (7개, 버림 0) | 통과 | replace → @cypress/request (레지스트리 있음, 최신 4.0.1, 알려진 취약점 없음) / request 2.88.2는 고친 버전이 없고 폐기됐다. 그래서 @cypress/request 3.0.0 이상으로 교체한다 [A1][R2][R3]. |
| spring-oss-eol | 조치 경로 | 통과 | 통과 (5개, 버림 0) | 통과 | upgrade_major / maestro-server/gradle.lockfile의 spring-webmvc를 7.0.9 이상으로 올린다. 7.0.10이 최신 공개 버전이다 [R1][R2]. |

정답 6/6 · 근거 번호 유효 6/6 · 위험한 추천 없음 6/6
