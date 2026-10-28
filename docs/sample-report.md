# FixGate 보고서 · shop-api

생성 2026-10-28 03:35 · 데이터: OSV(api.osv.dev), EPSS 2026-10-27, CISA KEV 2026.10.27
서비스: 노출 인터넷 · 중요도 high · 개인정보 처리 · 담당 커머스 개발팀

## 요약

- 구성요소 149개 중 15개에서 경보 67건
- 즉시 4 · 이번 주 16 · 계획 28 · 영향 없음 19
- 처리 단위로 묶으면 패키지 10개
- 검증 관문을 통과한 조치 3건 적용 → 경보 67건 → 22건, 즉시·이번 주 20건 → 1건
- 사람 검토로 넘긴 조치 1건

## 처리 순서

| 단계 | 패키지 | 경보 | 가장 급한 이유 |
|---|---|---|---|
| 즉시 | axios@0.21.1 | 24 | 30일 내 악용 확률 8.5% (상위 5.0%) [EPSS 2026-10-27] |
| 즉시 | lodash@4.17.20 | 5 | 30일 내 악용 확률 21.3% (상위 2.4%) [EPSS 2026-10-27] |
| 즉시 | qs@6.7.0 (간접) | 5 | 30일 내 악용 확률 15.6% (상위 3.2%) [EPSS 2026-10-27] |
| 이번 주 | body-parser@1.19.0 (간접) | 3 | 심각도 HIGH [OSV GHSA-27r3-jxmh-p828] |
| 이번 주 | jsonwebtoken@8.5.1 | 3 | 심각도 HIGH [OSV GHSA-8cf7-32gw-wr33] |
| 이번 주 | path-to-regexp@0.1.7 (간접) | 3 | 심각도 HIGH [OSV GHSA-37ch-88jc-xwx2] |
| 계획 | express@4.17.1 | 2 | 심각도 LOW, 악용 확률 0.49% [OSV GHSA-qw6h-vgh9-j6wx, EPSS 2026-10-27] |
| 계획 | cookie@0.4.0 (간접) | 1 | 심각도 LOW, 악용 확률 0.74% [OSV GHSA-pxg6-pf52-xh8x, EPSS 2026-10-27] |
| 계획 | send@0.17.1 (간접) | 1 | 심각도 LOW, 악용 확률 0.54% [OSV GHSA-m6fv-jmcg-4jfg, EPSS 2026-10-27] |
| 계획 | serve-static@1.14.1 (간접) | 1 | 심각도 LOW, 악용 확률 0.63% [OSV GHSA-cm22-4g7w-348p, EPSS 2026-10-27] |
| 영향 없음 | js-yaml@4.1.0 (간접) | 5 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development] |
| 영향 없음 | nanoid@3.1.23 (간접) | 5 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development] |
| 영향 없음 | minimatch@3.0.4 (간접) | 4 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development] |
| 영향 없음 | serialize-javascript@6.0.0 (간접) | 4 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development] |
| 영향 없음 | diff@5.0.0 (간접) | 1 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development] |

## 검증된 조치

### ✅ axios 0.21.1 → 0.34.0 (직접 의존성, 대상 경보 24건)

- 0.34.0: 통과 설치 성공 / 통과 기존 테스트 통과 / 통과 재스캔에서 대상 24건 사라짐 / 통과 새로 생긴 취약점 없음

### ✅ lodash 4.17.20 → 4.18.1 (직접 의존성, 대상 경보 5건)

- 4.18.1: 통과 설치 성공 / 통과 기존 테스트 통과 / 통과 재스캔에서 대상 5건 사라짐 / 통과 새로 생긴 취약점 없음

### ⛔ jsonwebtoken 8.5.1 → 9.0.0 (직접 의존성, 대상 경보 3건)

- 9.0.0: 통과 설치 성공 / 실패 기존 테스트 실패

  릴리스 노트 (github.com/auth0/node-jsonwebtoken/CHANGELOG.md):

```
## 9.0.0 - 2022-12-21
**Breaking changes: See [Migration from v8 to v9](https://github.com/auth0/node-jsonwebtoken/wiki/Migration-Notes:-v8-to-v9)**
### Breaking changes
- Removed support for Node versions 11 and below.
- The verify() function no longer accepts unsigned tokens by default. ([834503079514b72264fd13023a3b8d648afd6a16]https://github.com/auth0/node-jsonwebtoken/commit/834503079514b72264fd13023a3b8d648afd6a16)
- RSA key size must be 2048 bits or greater. ([ecdf6cc6073ea13a7e71df5fad043550f08d0fa6]https://github.com/auth0/node-jsonwebtoken/commit/ecdf6cc6073ea13a7e71df5fad043550f08d0fa6)
- Key types must be valid for the signing / verification algorithm
### Security fixes
- security: fixes `Arbitrary File Write via verify function` - CVE-2022-23529
- security: fixes `Insecure default algorithm in jwt.verify() could lead to signature validation bypass` - CVE-2022-23540
- security: fixes `Insecure implementation of key retrieval function could lead to Forgeable Public/Private Tokens from RSA to HMAC` - CVE-2022-23541
- security: fixes `Unrestricted key type could lead to legacy keys usage` - CVE-2022-23539
```

  테스트 기록:

```
    at next (<작업 사본>\node_modules\express\lib\router\index.js:275:10)
    at <작업 사본>\node_modules\body-parser\lib\read.js:130:5
✖ login issues a token that /me accepts (28.4256ms)
✔ me rejects a forged token (3.089ms)
✔ stock is read from the inventory service (6.362ms)
✔ receipt renders order totals (2.0443ms)
ℹ tests 4
ℹ suites 0
ℹ pass 3
ℹ fail 1
ℹ cancelled 0
ℹ skipped 0
ℹ todo 0
ℹ duration_ms 226.8666
✖ failing tests:
test at test\app.test.js:35:1
✖ login issues a token that /me accepts (28.4256ms)
  AssertionError [ERR_ASSERTION]: Expected values to be strictly equal:
  500 !== 200
      at TestContext.<anonymous> (<작업 사본>\test\app.test.js:41:10)
      at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
      at async Test.run (node:internal/test_runner/test:1125:7)
      at async startSubtestAfterBootstrap (node:internal/test_runner/harness:358:3) {
    generatedMessage: true,
    code: 'ERR_ASSERTION',
    actual: 500,
    expected: 200,
    operator: 'strictEqual',
    diff: 'simple'
  }
```

  **원인 설명 (LLM sonnet, 확신 medium)**: 9.0.0부터 RSA 키는 2048비트 이상이어야 한다 [N6]. 테스트는 1024비트 키를 만들어 쓴다 [T7][T9]. 그래서 jwt.sign이 키를 거부한 것으로 보이고, /login이 500을 반환했다 [C2][L9]. 다만 실제 오류 메시지는 로그에 없어서 확정은 아니다.

  - 근거 [N6] github.com/auth0/node-jsonwebtoken/CHANGELOG.md: - RSA key size must be 2048 bits or greater. ([ecdf6cc6073ea13a7e71df5fad043550f08d0fa6]https://github.com/auth0/node-jsonwebtoken/commit/ecdf6cc6073ea13a7e71df5fad043550f08d0fa6)
  - 근거 [T7] test/app.test.js:7 // The production key pair is 1024-bit RSA, issued before the 2048-bit policy.
  - 근거 [T9] test/app.test.js:9 modulusLength: 1024,
  - 근거 [C2] src/app.js:14 const token = jwt.sign({ sub: userId }, privateKey, { algorithm: "RS256", expiresIn: "1h" });
  - 근거 [L9]   500 !== 200

  1. **추천** 운영 키를 2048비트 이상으로 교체하고 테스트 키도 맞춘다 (위험 낮음) — 새 RSA 2048비트 이상 키 쌍을 발급하고 테스트의 modulusLength를 2048로 올린다. 그 뒤 9.0.0으로 올려 취약점 3건 조치를 유지한다. 운영 키는 1024비트라 [T7] 교체 일정과 기존 토큰 처리 계획이 필요하다. 이 부분은 주어진 사실에 없어 불확실하다.
  2. 테스트 키만 2048비트로 바꾸고 운영 키 교체는 따로 진행한다 (위험 보통) — 테스트는 통과시킬 수 있다. 하지만 운영 키가 1024비트면 [T7] 배포 후 서명이 실패할 수 있다. 운영 키 교체를 먼저 끝내거나 같은 배포에 넣어야 한다.
  3. 8.5.1을 유지하거나 키 크기 검사를 우회한다 (위험 높음) — 취약점 3건이 그대로 남는다. 인터넷에 노출되고 개인정보를 처리하는 서비스라 보안을 약하게 만드는 선택이다. 우회 옵션이 있는지도 주어진 사실에 없다.

→ 사람 검토 필요. 위 기록과 함께 담당 개발팀에 넘깁니다.

### ✅ express 4.17.1 → 4.22.3 (직접 의존성, 대상 경보 2건)

- 4.20.0: 통과 설치 성공 / 통과 기존 테스트 통과 / 통과 재스캔에서 대상 2건 사라짐 / 실패 새로 생긴 취약점: qs GHSA-q8mj-m7cp-5q26

- 4.22.3: 통과 설치 성공 / 통과 기존 테스트 통과 / 통과 재스캔에서 대상 2건 사라짐 / 통과 새로 생긴 취약점 없음

### package.json 변경

```diff
--- package.json (원본)
+++ package.json (조치 후)
@@ -8,10 +8,10 @@
     "test": "node --test \"test/*.test.js\""
   },
   "dependencies": {
-    "axios": "0.21.1",
-    "express": "4.17.1",
+    "axios": "0.34.0",
+    "express": "4.22.3",
     "jsonwebtoken": "8.5.1",
-    "lodash": "4.17.20"
+    "lodash": "4.18.1"
   },
   "devDependencies": {
     "mocha": "9.1.0"
```


## 경보 상세

### 즉시 (4)

- **axios@0.21.1** · [GHSA-cph5-m8f7-6c5x](https://osv.dev/vulnerability/GHSA-cph5-m8f7-6c5x) CVE-2021-3749 · HIGH · 고친 버전 0.21.2 — axios Inefficient Regular Expression Complexity vulnerability
  - 30일 내 악용 확률 8.5% (상위 5.0%) [EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-pjwm-pj3p-43mv](https://osv.dev/vulnerability/GHSA-pjwm-pj3p-43mv) CVE-2026-44492 · HIGH · 고친 버전 0.32.0 — axios's shouldBypassProxy does not recognize IPv4-mapped IPv6 addresses, allowing NO_PROXY bypass (incomplete fix for CVE-2025-62718)
  - 30일 내 악용 확률 12.3% (상위 3.8%) [EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **lodash@4.17.20** · [GHSA-35jh-r3h4-6jhm](https://osv.dev/vulnerability/GHSA-35jh-r3h4-6jhm) CVE-2021-23337 · HIGH · 고친 버전 4.17.21 — Command Injection in lodash
  - 30일 내 악용 확률 21.3% (상위 2.4%) [EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (template, sumBy 호출) [src/receipt.js:1]
- **qs@6.7.0** · [GHSA-hrpp-h998-j3pp](https://osv.dev/vulnerability/GHSA-hrpp-h998-j3pp) CVE-2022-24999 · HIGH · 고친 버전 6.7.3 — qs vulnerable to Prototype Pollution
  - 30일 내 악용 확률 15.6% (상위 3.2%) [EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → qs@6.7.0 [SBOM dependencies]

### 이번 주 (16)

- **axios@0.21.1** · [GHSA-3g43-6gmg-66jw](https://osv.dev/vulnerability/GHSA-3g43-6gmg-66jw) CVE-2026-44495 · HIGH · 고친 버전 0.31.1 — axios Vulnerable to Credential Theft and Response Hijacking via Prototype Pollution Gadget in Config Merge
  - 심각도 HIGH [OSV GHSA-3g43-6gmg-66jw]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-43fc-jf86-j433](https://osv.dev/vulnerability/GHSA-43fc-jf86-j433) CVE-2026-25639 · HIGH · 고친 버전 0.30.3 — Axios is Vulnerable to Denial of Service via __proto__ Key in mergeConfig
  - 심각도 HIGH [OSV GHSA-43fc-jf86-j433]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-6chq-wfr3-2hj9](https://osv.dev/vulnerability/GHSA-6chq-wfr3-2hj9) CVE-2026-42035 · HIGH · 고친 버전 0.31.1 — Axios: Header Injection via Prototype Pollution
  - 심각도 HIGH [OSV GHSA-6chq-wfr3-2hj9]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-hfxv-24rg-xrqf](https://osv.dev/vulnerability/GHSA-hfxv-24rg-xrqf) CVE-2026-44496 · HIGH · 고친 버전 0.32.0 — Axios: Regular Expression Denial of Service (ReDoS) via Cookie Name Injection
  - 심각도 HIGH [OSV GHSA-hfxv-24rg-xrqf]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-j5f8-grm9-p9fc](https://osv.dev/vulnerability/GHSA-j5f8-grm9-p9fc) CVE-2026-44486 · HIGH · 고친 버전 0.32.0 — Axios: Proxy-Authorization header leaks to redirect target when proxy is re-evaluated to direct connection
  - 심각도 HIGH [OSV GHSA-j5f8-grm9-p9fc]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-jr5f-v2jv-69x6](https://osv.dev/vulnerability/GHSA-jr5f-v2jv-69x6) CVE-2025-27152 · HIGH · 고친 버전 0.30.0 — axios Requests Vulnerable To Possible SSRF and Credential Leakage via Absolute URL
  - 심각도 HIGH [OSV GHSA-jr5f-v2jv-69x6]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-p92q-9vqr-4j8v](https://osv.dev/vulnerability/GHSA-p92q-9vqr-4j8v) CVE-2026-44487 · HIGH · 고친 버전 0.32.0 — Axios: Proxy-Authorization Credential Leak to Origin Server Across HTTP-to-HTTPS Redirect in Axios Node.js HTTP Adapter
  - 심각도 HIGH [OSV GHSA-p92q-9vqr-4j8v]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-pf86-5x62-jrwf](https://osv.dev/vulnerability/GHSA-pf86-5x62-jrwf) CVE-2026-42033 · HIGH · 고친 버전 0.31.1 — Axios: Prototype Pollution Gadgets - Response Tampering, Data Exfiltration, and Request Hijacking
  - 심각도 HIGH [OSV GHSA-pf86-5x62-jrwf]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-pmwg-cvhr-8vh7](https://osv.dev/vulnerability/GHSA-pmwg-cvhr-8vh7) CVE-2026-42043 · HIGH · 고친 버전 0.31.1 — Axios: Incomplete Fix for CVE-2025-62718 — NO_PROXY Protection Bypassed via RFC 1122 Loopback Subnet (127.0.0.0/8) in Axios 1.15.0
  - 심각도 HIGH [OSV GHSA-pmwg-cvhr-8vh7]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **body-parser@1.19.0** · [GHSA-27r3-jxmh-p828](https://osv.dev/vulnerability/GHSA-27r3-jxmh-p828) CVE-2026-111181 · HIGH · 고친 버전 1.20.9 — body-parser vulnerable to Denial of Service via trailing bytes after a compressed request body
  - 심각도 HIGH [OSV GHSA-27r3-jxmh-p828]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → body-parser@1.19.0 [SBOM dependencies]
- **body-parser@1.19.0** · [GHSA-qwcr-r2fm-qrc7](https://osv.dev/vulnerability/GHSA-qwcr-r2fm-qrc7) CVE-2024-45590 · HIGH · 고친 버전 1.20.3 — body-parser vulnerable to denial of service when url encoding is enabled
  - 심각도 HIGH [OSV GHSA-qwcr-r2fm-qrc7]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → body-parser@1.19.0 [SBOM dependencies]
- **jsonwebtoken@8.5.1** · [GHSA-8cf7-32gw-wr33](https://osv.dev/vulnerability/GHSA-8cf7-32gw-wr33) CVE-2022-23539 · HIGH · 고친 버전 9.0.0 — jsonwebtoken unrestricted key type could lead to legacy keys usage 
  - 심각도 HIGH [OSV GHSA-8cf7-32gw-wr33]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (sign, verify 호출) [src/app.js:2]
- **lodash@4.17.20** · [GHSA-r5fr-rjxr-66jc](https://osv.dev/vulnerability/GHSA-r5fr-rjxr-66jc) CVE-2026-4800 · HIGH · 고친 버전 4.18.0 — lodash vulnerable to Code Injection via `_.template` imports key names
  - 심각도 HIGH [OSV GHSA-r5fr-rjxr-66jc]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (template, sumBy 호출) [src/receipt.js:1]
- **path-to-regexp@0.1.7** · [GHSA-37ch-88jc-xwx2](https://osv.dev/vulnerability/GHSA-37ch-88jc-xwx2) CVE-2024-45296 · HIGH · 고친 버전 0.1.13 — path-to-regexp vulnerable to Regular Expression Denial of Service via multiple route parameters
  - 심각도 HIGH [OSV GHSA-37ch-88jc-xwx2]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → path-to-regexp@0.1.7 [SBOM dependencies]
- **path-to-regexp@0.1.7** · [GHSA-9wv6-86v2-598j](https://osv.dev/vulnerability/GHSA-9wv6-86v2-598j) CVE-2024-45296 · HIGH · 고친 버전 0.1.10 — path-to-regexp outputs backtracking regular expressions
  - 심각도 HIGH [OSV GHSA-9wv6-86v2-598j]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → path-to-regexp@0.1.7 [SBOM dependencies]
- **path-to-regexp@0.1.7** · [GHSA-rhx6-c78j-4q9w](https://osv.dev/vulnerability/GHSA-rhx6-c78j-4q9w) CVE-2024-52798 · HIGH · 고친 버전 0.1.12 — path-to-regexp contains a ReDoS
  - 심각도 HIGH [OSV GHSA-rhx6-c78j-4q9w]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → path-to-regexp@0.1.7 [SBOM dependencies]

### 계획 (28)

- **axios@0.21.1** · [GHSA-3p68-rc4w-qgx5](https://osv.dev/vulnerability/GHSA-3p68-rc4w-qgx5) CVE-2025-62718 · MODERATE · 고친 버전 0.31.0 — Axios has a NO_PROXY Hostname Normalization Bypass that Leads to SSRF
  - 심각도 MODERATE, 악용 확률 1.2% [OSV GHSA-3p68-rc4w-qgx5, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-5c9x-8gcm-mpgx](https://osv.dev/vulnerability/GHSA-5c9x-8gcm-mpgx) CVE-2026-42034 · MODERATE · 고친 버전 0.31.1 — Axios' HTTP adapter-streamed uploads bypass maxBodyLength when maxRedirects: 0
  - 심각도 MODERATE, 악용 확률 0.33% [OSV GHSA-5c9x-8gcm-mpgx, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-62hf-57xw-28j9](https://osv.dev/vulnerability/GHSA-62hf-57xw-28j9) CVE-2026-42039 · MODERATE · 고친 버전 0.31.1 — Axios: unbounded recursion in toFormData causes DoS via deeply nested request data
  - 심각도 MODERATE, 악용 확률 0.77% [OSV GHSA-62hf-57xw-28j9, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-7q8q-rj6j-mhjq](https://osv.dev/vulnerability/GHSA-7q8q-rj6j-mhjq) CVE-2026-67319 · MODERATE · 고친 버전 0.33.0 — Axios: Nested axios option objects can consume polluted prototype values
  - 심각도 MODERATE, 악용 확률 0.32% [OSV GHSA-7q8q-rj6j-mhjq, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-898c-q2cr-xwhg](https://osv.dev/vulnerability/GHSA-898c-q2cr-xwhg) CVE-2026-44490 · MODERATE · 고친 버전 0.32.0 — axios has DoS & Header Injection via Prototype Pollution Read-Side Gadgets in axios merge functions
  - 심각도 MODERATE, 악용 확률 0.33% [OSV GHSA-898c-q2cr-xwhg, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-fvcv-3m26-pcqx](https://osv.dev/vulnerability/GHSA-fvcv-3m26-pcqx) CVE-2026-40175 · MODERATE · 고친 버전 0.31.0 — Axios has Unrestricted Cloud Metadata Exfiltration via Header Injection Chain
  - 심각도 MODERATE, 악용 확률 1.9% [OSV GHSA-fvcv-3m26-pcqx, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-m7pr-hjqh-92cm](https://osv.dev/vulnerability/GHSA-m7pr-hjqh-92cm) CVE-2026-42038 · MODERATE · 고친 버전 0.31.1 — Axios: no_proxy bypass via IP alias allows SSRF
  - 심각도 MODERATE, 악용 확률 0.32% [OSV GHSA-m7pr-hjqh-92cm, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-mmx7-hfxf-jppx](https://osv.dev/vulnerability/GHSA-mmx7-hfxf-jppx) CVE-2026-67316 · MODERATE · 고친 버전 0.33.0 — Axios: Prototype pollution gadgets can alter axios request construction
  - 심각도 MODERATE, 악용 확률 0.42% [OSV GHSA-mmx7-hfxf-jppx, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-vf2m-468p-8v99](https://osv.dev/vulnerability/GHSA-vf2m-468p-8v99) CVE-2026-42036 · MODERATE · 고친 버전 0.31.1 — Axios: HTTP adapter streamed responses bypass maxContentLength
  - 심각도 MODERATE, 악용 확률 0.33% [OSV GHSA-vf2m-468p-8v99, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-w9j2-pvgh-6h63](https://osv.dev/vulnerability/GHSA-w9j2-pvgh-6h63) CVE-2026-42041 · MODERATE · 고친 버전 0.31.1 — Axios: Authentication Bypass via Prototype Pollution Gadget in `validateStatus` Merge Strategy
  - 심각도 MODERATE, 악용 확률 0.66% [OSV GHSA-w9j2-pvgh-6h63, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-wf5p-g6vw-rhxx](https://osv.dev/vulnerability/GHSA-wf5p-g6vw-rhxx) CVE-2023-45857 · MODERATE · 고친 버전 0.28.0 — Axios Cross-Site Request Forgery Vulnerability
  - 심각도 MODERATE, 악용 확률 0.71% [OSV GHSA-wf5p-g6vw-rhxx, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-xhjh-pmcv-23jw](https://osv.dev/vulnerability/GHSA-xhjh-pmcv-23jw) CVE-2026-42040 · LOW · 고친 버전 0.31.1 — Axios: Null Byte Injection via Reverse-Encoding in AxiosURLSearchParams
  - 심각도 LOW, 악용 확률 0.22% [OSV GHSA-xhjh-pmcv-23jw, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **axios@0.21.1** · [GHSA-xx6v-rp6x-q39c](https://osv.dev/vulnerability/GHSA-xx6v-rp6x-q39c) CVE-2026-42042 · MODERATE · 고친 버전 0.31.1 — Axios: XSRF Token Cross-Origin Leakage via Prototype Pollution Gadget in `withXSRFToken` Boolean Coercion
  - 심각도 MODERATE, 악용 확률 0.21% [OSV GHSA-xx6v-rp6x-q39c, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (get 호출) [src/app.js:3]
- **body-parser@1.19.0** · [GHSA-v422-hmwv-36x6](https://osv.dev/vulnerability/GHSA-v422-hmwv-36x6) CVE-2026-12590 · LOW · 고친 버전 1.20.6 — body-parser vulnerable to denial of service when invalid limit value silently disables size enforcement
  - 심각도 LOW, 악용 확률 0.41% [OSV GHSA-v422-hmwv-36x6, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → body-parser@1.19.0 [SBOM dependencies]
- **cookie@0.4.0** · [GHSA-pxg6-pf52-xh8x](https://osv.dev/vulnerability/GHSA-pxg6-pf52-xh8x) CVE-2024-47764 · LOW · 고친 버전 0.7.0 — cookie accepts cookie name, path, and domain with out of bounds characters
  - 심각도 LOW, 악용 확률 0.74% [OSV GHSA-pxg6-pf52-xh8x, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → cookie@0.4.0 [SBOM dependencies]
- **express@4.17.1** · [GHSA-qw6h-vgh9-j6wx](https://osv.dev/vulnerability/GHSA-qw6h-vgh9-j6wx) CVE-2024-43796 · LOW · 고친 버전 4.20.0 — express vulnerable to XSS via response.redirect()
  - 심각도 LOW, 악용 확률 0.49% [OSV GHSA-qw6h-vgh9-j6wx, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (json 호출) [src/app.js:1]
- **express@4.17.1** · [GHSA-rv95-896h-c2vc](https://osv.dev/vulnerability/GHSA-rv95-896h-c2vc) CVE-2024-29041 · MODERATE · 고친 버전 4.19.2 — Express.js Open Redirect in malformed URLs
  - 심각도 MODERATE, 악용 확률 0.79% [OSV GHSA-rv95-896h-c2vc, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (json 호출) [src/app.js:1]
- **jsonwebtoken@8.5.1** · [GHSA-hjrf-2m68-5959](https://osv.dev/vulnerability/GHSA-hjrf-2m68-5959) CVE-2022-23541 · MODERATE · 고친 버전 9.0.0 — jsonwebtoken's insecure implementation of key retrieval function could lead to Forgeable Public/Private Tokens from RSA to HMAC
  - 심각도 MODERATE, 악용 확률 0.81% [OSV GHSA-hjrf-2m68-5959, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (sign, verify 호출) [src/app.js:2]
- **jsonwebtoken@8.5.1** · [GHSA-qwph-4952-7xr6](https://osv.dev/vulnerability/GHSA-qwph-4952-7xr6) CVE-2022-23540 · MODERATE · 고친 버전 9.0.0 — jsonwebtoken vulnerable to signature validation bypass due to insecure default algorithm in jwt.verify()
  - 심각도 MODERATE, 악용 확률 0.57% [OSV GHSA-qwph-4952-7xr6, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (sign, verify 호출) [src/app.js:2]
- **lodash@4.17.20** · [GHSA-29mw-wpgm-hmr9](https://osv.dev/vulnerability/GHSA-29mw-wpgm-hmr9) CVE-2020-28500 · MODERATE · 고친 버전 4.17.21 — Regular Expression Denial of Service (ReDoS) in lodash
  - 심각도 MODERATE, 악용 확률 7.3% [OSV GHSA-29mw-wpgm-hmr9, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (template, sumBy 호출) [src/receipt.js:1]
- **lodash@4.17.20** · [GHSA-f23m-r3pf-42rh](https://osv.dev/vulnerability/GHSA-f23m-r3pf-42rh) CVE-2026-2950 · MODERATE · 고친 버전 4.18.0 — lodash vulnerable to Prototype Pollution via array path bypass in `_.unset` and `_.omit`
  - 심각도 MODERATE, 악용 확률 0.33% [OSV GHSA-f23m-r3pf-42rh, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (template, sumBy 호출) [src/receipt.js:1]
- **lodash@4.17.20** · [GHSA-xxjr-mmjv-4gpg](https://osv.dev/vulnerability/GHSA-xxjr-mmjv-4gpg) CVE-2025-13465 · MODERATE · 고친 버전 4.17.23 — Lodash has Prototype Pollution Vulnerability in `_.unset` and `_.omit` functions
  - 심각도 MODERATE, 악용 확률 1.8% [OSV GHSA-xxjr-mmjv-4gpg, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 운영 코드에서 직접 사용 (template, sumBy 호출) [src/receipt.js:1]
- **qs@6.7.0** · [GHSA-4mjr-xmp4-gh2g](https://osv.dev/vulnerability/GHSA-4mjr-xmp4-gh2g) CVE-2026-82417 · MODERATE · 고친 버전 6.16.0 — qs: Denial of Service via Attacker Controlled isBuffer
  - 심각도 MODERATE, 악용 확률 0.40% [OSV GHSA-4mjr-xmp4-gh2g, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → qs@6.7.0 [SBOM dependencies]
- **qs@6.7.0** · [GHSA-6pq8-jhm2-2vcw](https://osv.dev/vulnerability/GHSA-6pq8-jhm2-2vcw) CVE-2026-110816 · MODERATE · 고친 버전 6.16.1 — qs : qs.stringify with arrayFormat 'comma' throws an uncaught TypeError on array elements carrying a non-callable own toString (DoS)
  - 심각도 MODERATE, 악용 확률 0.37% [OSV GHSA-6pq8-jhm2-2vcw, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → qs@6.7.0 [SBOM dependencies]
- **qs@6.7.0** · [GHSA-6rw7-vpxm-498p](https://osv.dev/vulnerability/GHSA-6rw7-vpxm-498p) CVE-2025-15284 · MODERATE · 고친 버전 6.14.1 — qs's arrayLimit bypass in its bracket notation allows DoS via memory exhaustion
  - 심각도 MODERATE, 악용 확률 0.45% [OSV GHSA-6rw7-vpxm-498p, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → qs@6.7.0 [SBOM dependencies]
- **qs@6.7.0** · [GHSA-w7fw-mjwx-w883](https://osv.dev/vulnerability/GHSA-w7fw-mjwx-w883) CVE-2026-2391 · LOW · 고친 버전 6.14.2 — qs's arrayLimit bypass in comma parsing allows denial of service
  - 심각도 LOW, 악용 확률 0.54% [OSV GHSA-w7fw-mjwx-w883, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → qs@6.7.0 [SBOM dependencies]
- **send@0.17.1** · [GHSA-m6fv-jmcg-4jfg](https://osv.dev/vulnerability/GHSA-m6fv-jmcg-4jfg) CVE-2024-43799 · LOW · 고친 버전 0.19.0 — send vulnerable to template injection that can lead to XSS
  - 심각도 LOW, 악용 확률 0.54% [OSV GHSA-m6fv-jmcg-4jfg, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → send@0.17.1 [SBOM dependencies]
- **serve-static@1.14.1** · [GHSA-cm22-4g7w-348p](https://osv.dev/vulnerability/GHSA-cm22-4g7w-348p) CVE-2024-43800 · LOW · 고친 버전 1.16.0 — serve-static vulnerable to template injection that can lead to XSS
  - 심각도 LOW, 악용 확률 0.63% [OSV GHSA-cm22-4g7w-348p, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 개인정보를 처리하는 서비스 [fixgate.json personalData]
  - 간접 의존성: express@4.17.1 → serve-static@1.14.1 [SBOM dependencies]

### 영향 없음 (19)

- **diff@5.0.0** · [GHSA-73rr-hh4g-fpgx](https://osv.dev/vulnerability/GHSA-73rr-hh4g-fpgx) CVE-2026-24001 · LOW · 고친 버전 5.2.2 — jsdiff has a Denial of Service vulnerability in parsePatch and applyPatch
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **js-yaml@4.1.0** · [GHSA-2883-xcg3-v3hh](https://osv.dev/vulnerability/GHSA-2883-xcg3-v3hh) CVE-2026-84375 · HIGH · 고친 버전 4.3.2 — js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **js-yaml@4.1.0** · [GHSA-52cp-r559-cp3m](https://osv.dev/vulnerability/GHSA-52cp-r559-cp3m) CVE-2026-59869 · HIGH · 고친 버전 4.3.0 — js-yaml: YAML merge-key chains can force quadratic CPU consumption
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **js-yaml@4.1.0** · [GHSA-5p4m-2wfm-xmqj](https://osv.dev/vulnerability/GHSA-5p4m-2wfm-xmqj) · HIGH · 고친 버전 4.3.1 — JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **js-yaml@4.1.0** · [GHSA-h67p-54hq-rp68](https://osv.dev/vulnerability/GHSA-h67p-54hq-rp68) CVE-2026-53550 · MODERATE · 고친 버전 4.2.0 — JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **js-yaml@4.1.0** · [GHSA-mh29-5h37-fv8m](https://osv.dev/vulnerability/GHSA-mh29-5h37-fv8m) CVE-2025-64718 · MODERATE · 고친 버전 4.1.1 — js-yaml has prototype pollution in merge (<<)
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **minimatch@3.0.4** · [GHSA-23c5-xmqv-rm74](https://osv.dev/vulnerability/GHSA-23c5-xmqv-rm74) CVE-2026-27904 · HIGH · 고친 버전 3.1.4 — minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **minimatch@3.0.4** · [GHSA-3ppc-4f35-3m26](https://osv.dev/vulnerability/GHSA-3ppc-4f35-3m26) CVE-2026-26996 · HIGH · 고친 버전 3.1.3 — minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **minimatch@3.0.4** · [GHSA-7r86-cg39-jmmj](https://osv.dev/vulnerability/GHSA-7r86-cg39-jmmj) CVE-2026-27903 · HIGH · 고친 버전 3.1.3 — minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **minimatch@3.0.4** · [GHSA-f8q6-p94x-37v3](https://osv.dev/vulnerability/GHSA-f8q6-p94x-37v3) CVE-2022-3517 · HIGH · 고친 버전 3.0.5 — minimatch ReDoS vulnerability
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **nanoid@3.1.23** · [GHSA-28wg-ghj8-5hjv](https://osv.dev/vulnerability/GHSA-28wg-ghj8-5hjv) CVE-2026-67214 · HIGH · 고친 버전 3.3.16 — nanoid: non-secure generators can loop indefinitely with negative size
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **nanoid@3.1.23** · [GHSA-2v37-7h3g-55p8](https://osv.dev/vulnerability/GHSA-2v37-7h3g-55p8) CVE-2026-67213 · HIGH · 고친 버전 3.3.18 — nanoid: custom generators can loop indefinitely when size is zero
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **nanoid@3.1.23** · [GHSA-mwcw-c2x4-8c55](https://osv.dev/vulnerability/GHSA-mwcw-c2x4-8c55) CVE-2024-55565 · MODERATE · 고친 버전 3.3.8 — Predictable results in nanoid generation when given non-integer values
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **nanoid@3.1.23** · [GHSA-qrpm-p2h7-hrv2](https://osv.dev/vulnerability/GHSA-qrpm-p2h7-hrv2) CVE-2021-23566 · MODERATE · 고친 버전 3.1.31 — Exposure of Sensitive Information to an Unauthorized Actor in nanoid
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **nanoid@3.1.23** · [GHSA-xwg4-73v4-xw9w](https://osv.dev/vulnerability/GHSA-xwg4-73v4-xw9w) CVE-2026-73086 · HIGH · 고친 버전 3.3.12 — nanoid: Integer Overflow or Wraparound
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **serialize-javascript@6.0.0** · [GHSA-5c6j-r48x-rmvq](https://osv.dev/vulnerability/GHSA-5c6j-r48x-rmvq) · HIGH · 고친 버전 7.0.3 — Serialize JavaScript is Vulnerable to RCE via RegExp.flags and Date.prototype.toISOString()
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **serialize-javascript@6.0.0** · [GHSA-76p7-773f-r4q5](https://osv.dev/vulnerability/GHSA-76p7-773f-r4q5) CVE-2024-11831 · MODERATE · 고친 버전 6.0.2 — Cross-site Scripting (XSS) in serialize-javascript
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **serialize-javascript@6.0.0** · [GHSA-m5mm-p8h7-m29v](https://osv.dev/vulnerability/GHSA-m5mm-p8h7-m29v) CVE-2026-115754 · LOW · 고친 버전 7.1.3 — Serialize JavaScript: Cross-site scripting (XSS) via unescaped </script at the end of a serialized function body
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]
- **serialize-javascript@6.0.0** · [GHSA-qj8w-gfj5-8c6v](https://osv.dev/vulnerability/GHSA-qj8w-gfj5-8c6v) CVE-2026-34043 · MODERATE · 고친 버전 7.0.5 — Serialize JavaScript has CPU Exhaustion Denial of Service via crafted array-like objects
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 [SBOM cdx:npm:package:development]

조치 후 다시 스캔한 결과: 22건 (즉시 0 · 이번 주 1 · 계획 2 · 영향 없음 19)
