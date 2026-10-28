# 공개 프로젝트 측정 (2026-10-28)

npm lockfile을 커밋하는 공개 오픈소스 프로젝트 9개에 `scan`(읽기 전용)을 돌린 결과다. 각 저장소에서 `package.json`과 `package-lock.json`만 내려받았고 프로젝트 코드는 받지도 실행하지도 않았다. 실제 배포 맥락을 알 수 없어 모두 **인터넷 노출 · 중요도 medium**으로 가정했다. 데이터: OSV, EPSS 2026-10-27, CISA KEV 2026.10.27.

| 저장소 | 구성요소 | 경보 | 즉시 | 이번 주 | 계획 | 영향 없음 | 즉시·이번 주 패키지 |
|---|---|---|---|---|---|---|---|
| jitsi/jitsi-meet@b618c8e | 1,611 | 146 | 0 | 28 | 55 | 63 | 16 / 29 |
| sahat/hackathon-starter@1253cec | 640 | 11 | 0 | 5 | 5 | 1 | 2 / 3 |
| Kong/insomnia@eecc5b0 | 1,837 | 125 | 0 | 58 | 43 | 24 | 25 / 36 |
| bitwarden/clients@6a041c9 | 2,720 | 138 | 0 | 8 | 4 | 126 | 6 / 7 |
| node-red/node-red@22d019c | 939 | 20 | 0 | 5 | 3 | 12 | 3 / 4 |
| ghostfolio/ghostfolio@9772282 | 2,183 | 88 | 1 | 30 | 30 | 27 | 13 / 16 |
| mattermost/mattermost-webapp@149cb00 (2024 보관) | 1,721 | 219 | 3 | 32 | 46 | 138 | 20 / 31 |
| gothinkster/node-express-realworld-example-app@30b68e1 | 731 | 117 | 0 | 24 | 33 | 60 | 7 / 14 |
| bradtraversy/proshop-v2@e23e3a8 | 171 | 59 | 0 | 24 | 17 | 18 | 9 / 16 |
| **합계** | **12,553** | **923** | **4** | **214** | **236** | **469** | **101 / 156** |

- 경보 923건 중 **469건(50.8%)은 개발·테스트 전용 의존성**이라 운영에 들어가지 않는다 → VEX 제안.
- **즉시·이번 주는 218건(23.6%)**, 처리 단위인 패키지로 묶으면 **101개**.
- '즉시'(KEV 등재 또는 EPSS 상위 5%·10% 이상 + 인터넷 노출)는 4건뿐이다.
- 마지막 열은 '즉시·이번 주 경보가 있는 패키지 수 / 운영 경보가 있는 패키지 수'.

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
