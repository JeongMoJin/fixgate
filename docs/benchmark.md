# 공개 프로젝트 측정 (2026-10-28, 악성 패키지·의존성 혼동 규칙 반영)

npm lockfile을 커밋하는 공개 오픈소스 프로젝트 9개에 `scan`(읽기 전용)을 돌린 결과다. 각 저장소에서 `package.json`과 `package-lock.json`만 내려받았고 프로젝트 코드는 받지도 실행하지도 않았다. 실제 배포 맥락을 알 수 없어 모두 **인터넷 노출 · 중요도 medium**으로 가정했다. 데이터: OSV, EPSS 2026-10-27, CISA KEV 2026.10.27.

| 저장소 | 구성요소 | 경보 | 즉시 | 이번 주 | 계획 | 운영 영향 없음 | 즉시·이번 주 패키지 |
|---|---|---|---|---|---|---|---|
| jitsi/jitsi-meet@b618c8e | 1,611 | 146 | 0 | 28 | 55 | 63 | 16 / 29 |
| sahat/hackathon-starter@1253cec | 640 | 11 | 0 | 5 | 5 | 1 | 2 / 3 |
| Kong/insomnia@eecc5b0 | 1,837 | 125 | 0 | 58 | 43 | 24 | 25 / 36 |
| bitwarden/clients@6a041c9 | 2,720 | 138 | 0 | 8 | 4 | 126 | 6 / 7 |
| node-red/node-red@22d019c | 939 | 20 | 0 | 5 | 3 | 12 | 3 / 4 |
| ghostfolio/ghostfolio@9772282 | 2,183 | 88 | 1 | 30 | 30 | 27 | 13 / 16 |
| mattermost/mattermost-webapp@149cb00 (2024 보관) | 1,721 | 219 | 3 | 33 | 47 | 136 | 21 / 33 |
| gothinkster/node-express-realworld-example-app@30b68e1 | 731 | 117 | 0 | 24 | 33 | 60 | 7 / 14 |
| bradtraversy/proshop-v2@e23e3a8 | 171 | 59 | 0 | 24 | 17 | 18 | 9 / 16 |
| **합계** | **12,553** | **923** | **4** | **215** | **237** | **467** | **102 / 158** |

- **즉시·이번 주는 219건(23.7%)**: 이번 주 안에 볼 경보가 923건에서 219건으로 76% 줄고, 처리 단위인 패키지로 묶으면 **102개**다.
- **467건(50.6%)은 개발·테스트 전용 의존성**이라 운영 빌드에 들어가지 않는다 → '운영 영향 없음' VEX **제안**(담당자 승인 전까지 미확정). 빌드 환경 위험은 별도로 본다: 악성 패키지(OSV `MAL-`)는 개발 전용이어도 '즉시'.
- '즉시'(KEV 등재, EPSS 상위 5%·10% 이상 + 인터넷 노출, 악성 패키지)는 4건이다.
- **의존성 혼동 위험 3건**(mattermost-webapp): git에서 받는 내부 패키지 3개와 같은 이름의 악성 패키지가 npm에 등록돼 있다(MAL-2022-2637, MAL-2022-2820, MAL-2025-26534). 지금 설치되는 코드는 git 쪽이라 악성이 아니지만, 받는 경로가 바뀌면 악성 코드가 들어온다. FixGate는 이를 '악성 패키지 설치'와 구분해 운영 의존성은 '이번 주', 개발 의존성은 '계획'으로 둔다.
- 마지막 열은 '즉시·이번 주 경보가 있는 패키지 수 / 운영 경보가 있는 패키지 수'.

## 줄인 경보 안에 위험한 것이 있었나

이번 주 대상에서 빠진 704건을 다시 봤다.

- 운영 경보 454건 중 심각도 HIGH·CRITICAL 218건은 **모두** 즉시·이번 주에 남았다.
- 운영 경보 중 EPSS 상위 10%(10건)도 **모두** 즉시·이번 주에 남았다. KEV 등재 경보는 이 데이터에 없었다.
- '계획'으로 간 운영 경보는 MODERATE 182건, LOW 53건뿐이다(나머지 2건은 개발 의존성의 의존성 혼동 후보).
- 개발 전용 467건 중 233건은 HIGH 이상이거나 EPSS 상위 5%다. 운영 빌드에는 들어가지 않지만 빌드·CI 환경 위험이므로 '운영 영향 없음' 제안과 별도로 빌드 환경 트랙에서 본다. 승인 전에는 확정하지 않는다.

## 다시 돌리기

```bash
node scripts/bench.ts \
  jitsi/jitsi-meet@b618c8e45d585a07bd5830a8a3f9c6a56b6d3657 \
  sahat/hackathon-starter@1253cecdceaf2665fa15839bc7923584620efd88 \
  Kong/insomnia@eecc5b004ea4eef84838fa23e814ec4f72156e83 \
  bitwarden/clients@6a041c95a43823f9b64f943ea10740c3a41a7765 \
  node-red/node-red@22d019c4eccac31d95f3b6167c7334de72ef02a6 \
  ghostfolio/ghostfolio@97722822ed63245e3040fa59f268ca06761298a1 \
  mattermost/mattermost-webapp@149cb00b8282fbf3c31a82ed31b1be4d0b660883 \
  gothinkster/node-express-realworld-example-app@30b68e1e881462b2f4164ea09ab4c4f5699c7b0b \
  bradtraversy/proshop-v2@e23e3a897e5387f39da6c59fd72cdd12e46d0815
```

취약점 DB와 EPSS는 매일 바뀌므로 날짜가 다르면 숫자도 달라진다.

## 측정 중 고친 것

실제 lockfile 상당수가 peer dependency 충돌이나 package.json과의 불일치 때문에 `npm sbom`에서 거부됐다. 설치되는 버전과는 무관한 문제라, `--legacy-peer-deps`를 붙이고 그래도 실패하면 lockfile을 직접 해석해 SBOM을 만들도록 바꿨다 (`lockfileToCycloneDx`, 예제 서비스에서 npm SBOM과 149개 구성요소가 일치하는지 테스트).

## Java 서비스 5개 (Gradle lockfile)

Java 프로젝트는 대부분 lockfile을 커밋하지 않는다. 커밋하는 공개 프로젝트 중 서비스 모듈 5개를 골랐다. Gradle lockfile은 해석된 모든 모듈과 그 모듈이 올라가는 classpath를 적으므로, `runtimeClasspath`에 없는 모듈(컴파일·테스트 전용)은 운영에 들어가지 않는 것으로 본다. 의존 관계 그래프는 없어서 직접·간접은 구분하지 않는다.

| 서비스 | 구성요소 | 경보 | 즉시 | 이번 주 | 계획 | 운영 영향 없음 | 즉시·이번 주 패키지 | 안전 버전 있음 |
|---|---|---|---|---|---|---|---|---|
| datahub-project/datahub@1ac4f72 datahub-frontend | 636 | 12 | 0 | 3 | 1 | 8 | 2 / 2 | 2 / 2 |
| datahub-project/datahub@1ac4f72 datahub-upgrade | 701 | 6 | 0 | 4 | 1 | 1 | 3 / 3 | 3 / 3 |
| Netflix/maestro@5900c44 maestro-server | 255 | 34 | 0 | 7 | 7 | 20 | 3 / 8 | 3 / 3 |
| grimmory-tools/grimmory@021cb13 backend | 205 | 18 | 0 | 14 | 4 | 0 | 5 / 5 | 5 / 5 |
| bwaldvogel/mongo-java-server@e09dcfb (root) | 59 | 37 | 0 | 6 | 1 | 30 | 2 / 2 | 2 / 2 |
| **합계** | **1,856** | **107** | **0** | **34** | **14** | **59** | **15 / 20** | **15 / 15** |

- 이번 주 안에 볼 경보는 107건 중 34건, 패키지 15개다. 15개 모두 Maven Central에 알려진 취약점이 없는 버전이 있어 버전 고정(Gradle constraints, Maven dependencyManagement)으로 조치할 수 있다. 조치 적용과 빌드 검증은 아직 npm만 한다.
- Netflix Maestro의 Spring Framework 6.2.19에는 CRITICAL 권고 2건이 있는데 6.2.x 공개 수정이 없고 7.0.9부터 고쳐진다. FixGate는 이를 버전 고정이 아닌 '메이저 업그레이드' 경로로 넘겨 LLM이 보완 통제와 함께 계획을 낸다 ([sample-java-report.md](sample-java-report.md)).
- 이 측정을 하다가 네 자리 Maven 버전(1.1.10.7)과 빌드 구분자(-jre, .Final) 비교 오류, OSV의 `group:artifact` 이름 불일치를 찾아 고쳤다.

```bash
node scripts/bench.ts   gradle:datahub-project/datahub@1ac4f7289f49461bb361d1f297de4835ff47e395:datahub-frontend/gradle.lockfile   gradle:datahub-project/datahub@1ac4f7289f49461bb361d1f297de4835ff47e395:datahub-upgrade/gradle.lockfile   gradle:Netflix/maestro@5900c44f7f5923e60feffed726a116d40a1abbbb:maestro-server/gradle.lockfile   gradle:grimmory-tools/grimmory@021cb138dc7f19583142c55fd5070201c40b403b:backend/gradle.lockfile   gradle:bwaldvogel/mongo-java-server@e09dcfb7a49811fbe0543f23560eae9bb7deae95:gradle.lockfile
```
