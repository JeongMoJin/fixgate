# FixGate 보고서 · Netflix/maestro/maestro-server/gradle.lockfile

생성 2026-10-28 04:50 · 데이터: OSV(api.osv.dev), EPSS 2026-10-27, CISA KEV 2026.10.27
서비스: 노출 인터넷 · 중요도 medium · 개인정보 없음

## 요약

- SBOM 품질: 구성요소 255개 중 매칭 가능(PURL·버전) 255개, 의존 관계 없음 — 직접·간접 구분 불가, 공급자 표기 0개
- 구성요소 255개 중 17개에서 경보 34건
- 즉시 0 · 이번 주 7 · 계획 7 · 운영 영향 없음 20
- 처리 단위로 묶으면 패키지 8개

## 처리 순서

| 단계 | 패키지 | 경보 | 가장 급한 이유 |
|---|---|---|---|
| 이번 주 | org.apache.tomcat.embed/tomcat-embed-core@10.1.55 (간접) | 4 | 심각도 CRITICAL [OSV GHSA-9xv2-5v5q-p794] |
| 이번 주 | io.netty/netty-handler@4.1.136.Final (간접) | 2 | 심각도 CRITICAL [OSV GHSA-c4c3-7fpv-j4q5] |
| 이번 주 | org.springframework/spring-webmvc@6.2.19 (간접) | 2 | 심각도 CRITICAL [OSV GHSA-j9f9-w8pj-32f8] |
| 계획 | org.apache.commons/commons-compress@1.24.0 (간접) | 2 | 심각도 MODERATE, 악용 확률 0.90% [OSV GHSA-4265-ccf5-phj5, EPSS 2026-10-27] |
| 계획 | io.awspring.cloud/spring-cloud-aws-sns@3.4.2 (간접) | 1 | 심각도 MODERATE, 악용 확률 0.18% [OSV GHSA-r4w4-wv68-qv85, EPSS 2026-10-27] |
| 계획 | io.netty/netty-codec-http@4.1.136.Final (간접) | 1 | 심각도 MODERATE, 악용 확률 0.32% [OSV GHSA-8c42-7qj2-3j46, EPSS 2026-10-27] |
| 계획 | org.apache.logging.log4j/log4j-api@2.24.3 (간접) | 1 | 심각도 MODERATE, 악용 확률 0.60% [OSV GHSA-qv9r-c865-cp47, EPSS 2026-10-27] |
| 계획 | org.springframework.retry/spring-retry@2.0.12 (간접) | 1 | 심각도 MODERATE, 악용 확률 0.28% [OSV GHSA-2827-2mxx-j8pv, EPSS 2026-10-27] |
| 운영 영향 없음 | com.fasterxml.jackson.core/jackson-databind@2.21.4 (간접) | 9 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |
| 운영 영향 없음 | com.google.guava/guava@31.0.1-jre (간접) | 3 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |
| 운영 영향 없음 | com.fasterxml.jackson.core/jackson-core@2.21.4 (간접) | 2 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |
| 운영 영향 없음 | com.google.guava/guava@32.1.3-jre (간접) | 1 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |
| 운영 영향 없음 | commons-beanutils/commons-beanutils@1.9.4 (간접) | 1 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |
| 운영 영향 없음 | net.sourceforge.pmd/pmd-core@7.16.0 (간접) | 1 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |
| 운영 영향 없음 | org.apache.httpcomponents.client5/httpclient5@5.1.3 (간접) | 1 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |
| 운영 영향 없음 | org.apache.httpcomponents.core5/httpcore5-h2@5.1.3 (간접) | 1 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |
| 운영 영향 없음 | org.apache.httpcomponents.core5/httpcore5@5.1.3 (간접) | 1 | 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development] |

## 조치 계획

| 단계 | 패키지 | 현재 → 목표 | 방식 | 메모 |
|---|---|---|---|---|
| 이번 주 | org.apache.tomcat.embed/tomcat-embed-core | 10.1.55 → 10.1.59 | 빌드 도구 버전 고정 | 빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement) |
| 이번 주 | io.netty/netty-handler | 4.1.136.Final → 4.1.137.Final | 빌드 도구 버전 고정 | 빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement) |
| 이번 주 | org.springframework/spring-webmvc | 6.2.19 → 7.0.9 | 빌드 도구 버전 고정 | 빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement) — 메이저 변경, 테스트로 확인 필요 |
| 계획 | org.apache.commons/commons-compress | 1.24.0 → 1.26.0 | 빌드 도구 버전 고정 | 빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement) |
| 계획 | io.awspring.cloud/spring-cloud-aws-sns | 3.4.2 → 4.0.2 | 빌드 도구 버전 고정 | 빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement) — 메이저 변경, 테스트로 확인 필요 |
| 계획 | io.netty/netty-codec-http | 4.1.136.Final → 4.1.137.Final | 빌드 도구 버전 고정 | 빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement) |
| 계획 | org.apache.logging.log4j/log4j-api | 2.24.3 → 2.25.5 | 빌드 도구 버전 고정 | 빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement) |
| 계획 | org.springframework.retry/spring-retry | 2.0.12 → 2.0.13 | 빌드 도구 버전 고정 | 빌드 도구 버전 고정으로 조치 (Gradle constraints, Maven dependencyManagement) |

### org.springframework/spring-webmvc 6.2.19

  **조치 경로 (LLM openai:gpt-6.1-terra, 확신 medium, 근거 부족으로 판단 보류)**: 메이저 업그레이드
  1. 7.0.9로 메이저 업그레이드를 준비한다. [R2]
  2. 업그레이드 전 호환성과 서비스 동작을 확인한다.
  3. 적용 후 잠금 파일과 배포된 버전을 확인한다.
  보완 통제:
  - 수정 전까지 뷰 조각을 사용하는 SSE 기능의 사용 여부를 확인하고, 가능하면 사용을 중단한다. [A1d]
  - XsltView와 취약한 뷰 렌더링 조건의 사용 여부를 확인하고, 가능하면 해당 구성을 피한다. [A2d]
  남는 위험: 수정 전까지 취약한 사용 조건이 있으면 스트림 손상이나 SSRF·원격 코드 실행 위험이 남는다. 실제 사용 여부와 업그레이드 호환성은 확인되지 않았다. [A1d] [A2d]
  - 근거 [A1] GHSA-j9f9-w8pj-32f8 (CVE-2026-47890): Spring Framework Server Sent Event stream corruption while rendering fragments | 심각도 CRITICAL | 영향 범위 introduced 6.2.0, last_affected 6.2.19 / introduced 7.0.0, fixed 7.0.9 / introduced 6.2.0, last_affected 6.2.19 / introduced 7.0.0, fixed 7.0.9
  - 근거 [A2] GHSA-pc63-qcmh-9cmg (CVE-2026-47884): Spring Framework Improper Path Limitation in XsltView | 심각도 CRITICAL | 영향 범위 introduced 0, last_affected 5.2.25.RELEASE / introduced 5.3.0, last_affected 5.3.49 / introduced 6.0.0, last_affected 6.0.30 / introduced 6.1.0, last_affected 6.1.28 / introduced 6.2.0, last_affected 6.2.19 / introduced 7.0.0, fixed 7.0.9
  - 근거 [R2] 알려진 취약점이 없는 가장 작은 버전은 7.0.9 (메이저 변경)

### io.awspring.cloud/spring-cloud-aws-sns 3.4.2

  **조치 경로 (LLM openai:gpt-6.1-terra, 확신 medium, 근거 부족으로 판단 보류)**: 메이저 업그레이드
  1. spring-cloud-aws-sns를 알려진 취약점이 없는 최소 버전 4.0.2로 올리는 방안을 검토한다. [R2]
  2. 메이저 업그레이드의 호환성을 확인하고 테스트한 뒤 적용한다.
  3. 서비스에서 SNS HTTP/HTTPS 엔드포인트 지원 기능을 사용하는지 확인한다. [A1d]
  보완 통제:
  - 해당 SNS 엔드포인트의 사용 여부와 외부 접근 범위를 확인한다. [A1d]
  남는 위험: 수정 전에는 해당 엔드포인트를 사용하는 경우 URL을 아는 인증되지 않은 공격자가 SNS 메시지를 위조할 수 있다. 실제 기능 사용 여부는 확인되지 않았다. [A1d]
  - 근거 [A1] GHSA-r4w4-wv68-qv85 (CVE-2026-44308): Spring Cloud AWS missing SNS message signature verification allows spoofing of HTTP/HTTPS endpoint notifications | 심각도 MODERATE | 영향 범위 introduced 4.0.0, fixed 4.0.2 / introduced 3.0.0, last_affected 3.4.2
  - 근거 [R1] io.awspring.cloud/spring-cloud-aws-sns 현재 3.4.2. 같은 메이저(3.x)의 최신 공개 버전 3.4.2, 전체 최신 4.2.1
  - 근거 [R2] 알려진 취약점이 없는 가장 작은 버전은 4.0.2 (메이저 변경)

## 경보 상세

### 이번 주 (7)

- **io.netty/netty-handler@4.1.136.Final** · [GHSA-c4c3-7fpv-j4q5](https://osv.dev/vulnerability/GHSA-c4c3-7fpv-j4q5) CVE-2026-75595 · CRITICAL · 고친 버전 4.1.137.Final — Netty: SNI Routing Bypass via Fragmented TLS ClientHello Causing Fallback to Default SslContext
  - 심각도 CRITICAL [OSV GHSA-c4c3-7fpv-j4q5]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.apache.tomcat.embed/tomcat-embed-core@10.1.55** · [GHSA-9xv2-5v5q-p794](https://osv.dev/vulnerability/GHSA-9xv2-5v5q-p794) CVE-2026-65905 · CRITICAL · 고친 버전 10.1.58 — Apache Tomcat's DIGEST authenticator has an Authentication Bypass by Capture-replay vulnerability
  - 심각도 CRITICAL [OSV GHSA-9xv2-5v5q-p794]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.apache.tomcat.embed/tomcat-embed-core@10.1.55** · [GHSA-f525-44xv-f2qj](https://osv.dev/vulnerability/GHSA-f525-44xv-f2qj) CVE-2026-65637 · CRITICAL · 고친 버전 10.1.59 — Apache Tomcat - HTTP/2 no-authority bypass of strict SNI validation
  - 심각도 CRITICAL [OSV GHSA-f525-44xv-f2qj]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.apache.tomcat.embed/tomcat-embed-core@10.1.55** · [GHSA-gcx9-497g-6cp6](https://osv.dev/vulnerability/GHSA-gcx9-497g-6cp6) CVE-2026-65182 · CRITICAL · 고친 버전 10.1.58 — Apache Tomcat has an Improper Access Control, Incorrect Authorization vulnerability
  - 심각도 CRITICAL [OSV GHSA-gcx9-497g-6cp6]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.apache.tomcat.embed/tomcat-embed-core@10.1.55** · [GHSA-h3x4-894j-xpx5](https://osv.dev/vulnerability/GHSA-h3x4-894j-xpx5) CVE-2026-68525 · CRITICAL · 고친 버전 10.1.58 — Apache Tomcat's FORM authentication process has an Incorrect Authorization vulnerability
  - 심각도 CRITICAL [OSV GHSA-h3x4-894j-xpx5]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.springframework/spring-webmvc@6.2.19** · [GHSA-j9f9-w8pj-32f8](https://osv.dev/vulnerability/GHSA-j9f9-w8pj-32f8) CVE-2026-47890 · CRITICAL · 고친 버전 6.2.19 이후 — Spring Framework Server Sent Event stream corruption while rendering fragments
  - 심각도 CRITICAL [OSV GHSA-j9f9-w8pj-32f8]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.springframework/spring-webmvc@6.2.19** · [GHSA-pc63-qcmh-9cmg](https://osv.dev/vulnerability/GHSA-pc63-qcmh-9cmg) CVE-2026-47884 · CRITICAL · 고친 버전 6.2.19 이후 — Spring Framework Improper Path Limitation in XsltView
  - 심각도 CRITICAL [OSV GHSA-pc63-qcmh-9cmg]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]

### 계획 (7)

- **io.awspring.cloud/spring-cloud-aws-sns@3.4.2** · [GHSA-r4w4-wv68-qv85](https://osv.dev/vulnerability/GHSA-r4w4-wv68-qv85) CVE-2026-44308 · MODERATE · 고친 버전 3.4.2 이후 — Spring Cloud AWS missing SNS message signature verification allows spoofing of HTTP/HTTPS endpoint notifications
  - 심각도 MODERATE, 악용 확률 0.18% [OSV GHSA-r4w4-wv68-qv85, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **io.netty/netty-codec-http@4.1.136.Final** · [GHSA-8c42-7qj2-3j46](https://osv.dev/vulnerability/GHSA-8c42-7qj2-3j46) CVE-2026-59903 · MODERATE · 고친 버전 4.1.137.Final — Netty Vulnerable to Cache Poisoning and Information Disclosure via CORS Vary Header Overwrite
  - 심각도 MODERATE, 악용 확률 0.32% [OSV GHSA-8c42-7qj2-3j46, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **io.netty/netty-handler@4.1.136.Final** · [GHSA-fccg-mwvh-qqg4](https://osv.dev/vulnerability/GHSA-fccg-mwvh-qqg4) CVE-2026-75596 · MODERATE · 고친 버전 4.1.137.Final — Netty: Fragmented ClientHello records trigger quadratic pre-handshake reassembly in default SNI parsing
  - 심각도 MODERATE, 악용 확률 0.37% [OSV GHSA-fccg-mwvh-qqg4, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.apache.commons/commons-compress@1.24.0** · [GHSA-4265-ccf5-phj5](https://osv.dev/vulnerability/GHSA-4265-ccf5-phj5) CVE-2024-26308 · MODERATE · 고친 버전 1.26.0 — Apache Commons Compress: OutOfMemoryError unpacking broken Pack200 file
  - 심각도 MODERATE, 악용 확률 0.90% [OSV GHSA-4265-ccf5-phj5, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.apache.commons/commons-compress@1.24.0** · [GHSA-4g9r-vxhx-9pgx](https://osv.dev/vulnerability/GHSA-4g9r-vxhx-9pgx) CVE-2024-25710 · MODERATE · 고친 버전 1.26.0 — Apache Commons Compress: Denial of service caused by an infinite loop for a corrupted DUMP file
  - 심각도 MODERATE, 악용 확률 0.44% [OSV GHSA-4g9r-vxhx-9pgx, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.apache.logging.log4j/log4j-api@2.24.3** · [GHSA-qv9r-c865-cp47](https://osv.dev/vulnerability/GHSA-qv9r-c865-cp47) CVE-2026-49844 · MODERATE · 고친 버전 2.25.5 — Apache Log4j API: Improper encoding of non-finite floating-point values during MapMessage JSON serialization
  - 심각도 MODERATE, 악용 확률 0.60% [OSV GHSA-qv9r-c865-cp47, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]
- **org.springframework.retry/spring-retry@2.0.12** · [GHSA-2827-2mxx-j8pv](https://osv.dev/vulnerability/GHSA-2827-2mxx-j8pv) CVE-2026-41710 · MODERATE · 고친 버전 2.0.13 — Spring Retry has Cache Exhaustion in Stateful Retries that leads to Denial of Service
  - 심각도 MODERATE, 악용 확률 0.28% [OSV GHSA-2827-2mxx-j8pv, EPSS 2026-10-27]
  - 인터넷에 노출된 서비스 [fixgate.json exposure]
  - 도입 경로 정보 없음 (lockfile에 의존 관계가 없음) [SBOM]

### 운영 영향 없음 (20)

- **com.fasterxml.jackson.core/jackson-core@2.21.4** · [GHSA-7hhh-6rmp-j9qf](https://osv.dev/vulnerability/GHSA-7hhh-6rmp-j9qf) CVE-2026-89425 · HIGH · 고친 버전 2.21.7 — jackson-core: UTF8DataInputJsonParser._reportInvalidToken() missing maxErrorTokenLength limit -> unbounded StringBuilder growth (DoS)
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-core@2.21.4** · [GHSA-p6pp-m3f8-5c89](https://osv.dev/vulnerability/GHSA-p6pp-m3f8-5c89) CVE-2026-89407 · HIGH · 고친 버전 2.21.7 —  jackson-core: ReDoS: quadratic backtracking in NumberInput.PATTERN_FLOAT via looksLikeValidNumber()
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-5gvw-p9qm-jgwh](https://osv.dev/vulnerability/GHSA-5gvw-p9qm-jgwh) CVE-2026-59889 · MODERATE · 고친 버전 2.21.5 — jackson-databind: @JsonView bypassed for @JsonUnwrapped container properties on deserialization
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-5jmj-h7xm-6q6v](https://osv.dev/vulnerability/GHSA-5jmj-h7xm-6q6v) CVE-2026-54515 · MODERATE · 고친 버전 2.21.5 — jackson-databind has case-insensitive deserialization bypasses per-property @JsonIgnoreProperties
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-cxp5-3px4-pw24](https://osv.dev/vulnerability/GHSA-cxp5-3px4-pw24) CVE-2026-91777 · HIGH · 고친 버전 2.21.7 — jackson-databind quadratic forward-reference completion 
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-gx83-3vf8-gh7j](https://osv.dev/vulnerability/GHSA-gx83-3vf8-gh7j) CVE-2026-83557 · MODERATE · 고친 버전 2.21.6 — jackson-databind: Comparable missing from DefaultBaseTypeLimitingValidator's unsafe base types (incomplete PolymorphicTypeValidator denylist)
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-mhm7-754m-9p8w](https://osv.dev/vulnerability/GHSA-mhm7-754m-9p8w) · MODERATE · 고친 버전 2.21.5 — jackson-databind: `@JsonView` bypass for creator properties with `@JsonTypeInfo(include=As.EXTERNAL_PROPERTY)`
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-q4xh-88c3-wmh7](https://osv.dev/vulnerability/GHSA-q4xh-88c3-wmh7) CVE-2026-68497 · HIGH · 고친 버전 2.21.6 — jackson-databind: Duration XMLGregorianCalendar Unbounded Number Parse DoS
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-vvgp-rfg2-7rr6](https://osv.dev/vulnerability/GHSA-vvgp-rfg2-7rr6) CVE-2026-77310 · MODERATE · 고친 버전 2.21.5 — jackson-databind: Incomplete fix for CVE-2026-54514: eager DNS resolution (SSRF) still present in InetAddress deserialization
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-wjgm-6hv5-3cvf](https://osv.dev/vulnerability/GHSA-wjgm-6hv5-3cvf) CVE-2026-19032 · MODERATE · 고친 버전 2.21.6 — jackson-databind: Path Deserialization Missing Scheme Allowlist for FileSystemProvider Resolution
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.fasterxml.jackson.core/jackson-databind@2.21.4** · [GHSA-wv8q-qhhj-9h54](https://osv.dev/vulnerability/GHSA-wv8q-qhhj-9h54) CVE-2026-91776 · HIGH · 고친 버전 2.21.7 — jackson-databind retains every unknown raw type ID 
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.google.guava/guava@31.0.1-jre** · [GHSA-5mg8-w23w-74h3](https://osv.dev/vulnerability/GHSA-5mg8-w23w-74h3) CVE-2020-8908 · LOW · 고친 버전 32.0.0-android — Information Disclosure in Guava
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.google.guava/guava@31.0.1-jre** · [GHSA-7g45-4rm6-3mm3](https://osv.dev/vulnerability/GHSA-7g45-4rm6-3mm3) CVE-2023-2976 · MODERATE · 고친 버전 32.0.0-android — Guava vulnerable to insecure use of temporary directory
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.google.guava/guava@31.0.1-jre** · [GHSA-xxph-c9ww-hj94](https://osv.dev/vulnerability/GHSA-xxph-c9ww-hj94) CVE-2026-102554 · HIGH · 고친 버전 33.7.2 — Google Guava: CompactHashMap/CompactHashSet/MapMakerInternalMap deserialization triggers uncontrolled memory allocation
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **com.google.guava/guava@32.1.3-jre** · [GHSA-xxph-c9ww-hj94](https://osv.dev/vulnerability/GHSA-xxph-c9ww-hj94) CVE-2026-102554 · HIGH · 고친 버전 33.7.2 — Google Guava: CompactHashMap/CompactHashSet/MapMakerInternalMap deserialization triggers uncontrolled memory allocation
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **commons-beanutils/commons-beanutils@1.9.4** · [GHSA-wxr5-93ph-8wr9](https://osv.dev/vulnerability/GHSA-wxr5-93ph-8wr9) CVE-2025-48734 · HIGH · 고친 버전 1.11.0 — Apache Commons Improper Access Control vulnerability
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **net.sourceforge.pmd/pmd-core@7.16.0** · [GHSA-8rr6-2qw5-pc7r](https://osv.dev/vulnerability/GHSA-8rr6-2qw5-pc7r) CVE-2026-28338 · MODERATE · 고친 버전 7.22.0 — PMD Designer has Stored XSS in VBHTMLRenderer and YAHTMLRenderer via unescaped violation messages
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **org.apache.httpcomponents.client5/httpclient5@5.1.3** · [GHSA-hjcp-jmpx-g3qm](https://osv.dev/vulnerability/GHSA-hjcp-jmpx-g3qm) CVE-2026-64607 · MODERATE · 고친 버전 5.6.3 — Apache HttpComponents Client: Connection Leak on Content-Encoding Decode Error Leads to Pool Exhaustion DoS
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **org.apache.httpcomponents.core5/httpcore5-h2@5.1.3** · [GHSA-v3jc-474w-2wm6](https://osv.dev/vulnerability/GHSA-v3jc-474w-2wm6) CVE-2026-54428 · HIGH · 고친 버전 5.4.3 — Apache HttpComponents Core: HPackDecoder Unlimited Header List Size Before SETTINGS ACK
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]
- **org.apache.httpcomponents.core5/httpcore5@5.1.3** · [GHSA-hf6x-8p5f-cgmf](https://osv.dev/vulnerability/GHSA-hf6x-8p5f-cgmf) CVE-2026-54399 · HIGH · 고친 버전 5.4.3 — Apache HttpComponents Core HTTP/1 header parsing can cause memory-exhaustion denial of service
  - 개발·테스트에만 쓰는 의존성이라 운영 빌드에 들어가지 않음 (빌드 환경 위험은 별도 관리) [SBOM cdx:npm:package:development]

