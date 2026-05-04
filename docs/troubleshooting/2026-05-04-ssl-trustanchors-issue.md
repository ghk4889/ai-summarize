# Java SSL trustAnchors 오류 분석 보고서

- 작성일: 2026-05-04
- 프로젝트: AI Document Summarizer
- 환경: Windows, JDK 21, IntelliJ IDEA 2026.1, 회사 내부망

> **참고:** 본 문서에서 SSL 프록시 관련 명칭은 보안상 가명으로 대체되었습니다.
> - `CorpProxy SSL` → 실제 프록시 인증서 CN
> - `ACME Corp` → 실제 프록시 운영 조직명

---

## 1. 현상

Spring Boot 애플리케이션에서 Claude API(`https://api.anthropic.com`)를 호출할 때 다음 오류와 함께 500 Internal Server Error가 발생했다.

```
javax.net.ssl.SSLException: Unexpected error:
  java.security.InvalidAlgorithmParameterException: the trustAnchors parameter must be non-empty
```

이 오류는 Java가 HTTPS 연결을 맺을 때 **신뢰할 수 있는 인증서 목록(trustAnchors)이 비어 있다**는 의미이다.

---

## 2. 배경 지식

### SSL 인증서와 신뢰 체인

HTTPS 통신 시 서버는 자신의 신뢰성을 증명하기 위해 **SSL 인증서**를 제시한다. 이 인증서는 상위 인증 기관(CA)이 서명하며, 최상위에는 **루트 CA 인증서**가 있다.

```
[루트 CA 인증서]        ← 클라이언트가 미리 신뢰하고 있어야 함
    └─ [서버 인증서]    ← 서버가 접속 시 제시
```

Java는 `cacerts`라는 파일에 신뢰할 루트 CA 목록을 저장하고 있으며, 서버가 제시한 인증서의 루트 CA가 이 목록에 없으면 연결을 거부한다.

### 회사망의 SSL 인터셉션

회사 내부망에서는 보안 프록시가 외부 HTTPS 트래픽을 검사하기 위해 **SSL 인터셉션**을 수행하는 경우가 있다. 이 경우 프록시가 원본 서버 인증서를 자체 루트 CA로 재서명하여 전달한다.

```
[일반 환경]    브라우저 ──HTTPS──▶ api.anthropic.com
[회사망 환경]  브라우저 ──HTTPS──▶ 프록시 ──HTTPS──▶ api.anthropic.com
                                   ↑ 프록시가 자체 CA로 재서명한 인증서를 전달
```

따라서 회사망에서는 **프록시의 루트 CA 인증서**를 Java의 `cacerts`에 등록해야 한다.

---

## 3. 원인 분석

이번 오류는 두 가지 원인이 복합적으로 작용했다.

### 3.1 프록시 루트 CA 미등록

회사 프록시(CorpProxy SSL, ACME Corp)가 SSL 인터셉션을 수행하고 있었다.

```
서버 인증서 Subject: CN=api.anthropic.com
서버 인증서 Issuer:  CN=CorpProxy SSL, O=ACME Corp, C=KR
루트 CA Subject:     CN=CorpProxy SSL, O=ACME Corp, C=KR (자체 서명)
```

Java의 `cacerts`에 이 루트 CA가 없어 SSL 핸드셰이크가 실패했다.

초기 대응으로 서버 인증서(leaf cert)를 등록했으나, Java SSL 검증은 체인의 최상위인 **루트 CA 인증서**를 요구하므로 해결되지 않았다.

### 3.2 cacerts 비밀번호 변조 (핵심 원인)

인증서를 등록하기 위해 `keytool` 명령을 실행하는 과정에서, `cacerts` 파일 자체의 상태가 변경되었다.

| 항목 | 변경 전 (JDK 원본) | 변경 후 (keytool 수정) |
|------|-------------------|----------------------|
| 형식 | PKCS12 | PKCS12 |
| 비밀번호 보호 | 없음 | `changeit`으로 보호됨 |
| 비밀번호 없이 로드 시 | 97개 인증서 정상 로드 | **0개 (로드 실패)** |

`keytool -import -storepass changeit` 명령은 cacerts를 읽고 수정한 뒤 **비밀번호가 설정된 PKCS12 파일로 다시 저장**한다. 원본 cacerts는 비밀번호 없이도 인증서를 읽을 수 있었지만, 수정된 파일은 반드시 비밀번호를 제공해야 인증서를 읽을 수 있다.

Java의 `TrustManagerFactory`는 기본 cacerts를 **비밀번호 없이(null)** 로드하기 때문에, 수정된 cacerts에서 인증서를 하나도 읽지 못해 `trustAnchors parameter must be non-empty` 에러가 발생했다.

---

## 4. 해결 방법

### 4.1 프록시 루트 CA 등록

프록시의 루트 CA 인증서를 추출하여 Java `cacerts`에 등록한다.

```powershell
keytool -import -alias corpproxy-root-ca ^
  -keystore "C:\Program Files\Java\jdk-21\lib\security\cacerts" ^
  -storepass changeit ^
  -file "C:\Program Files\Java\jdk-21\lib\security\corpproxy_root_ca.crt" ^
  -noprompt
```

### 4.2 JVM trustStore 비밀번호 명시

`cacerts`가 비밀번호 보호 상태로 변경되었으므로, JVM이 해당 비밀번호를 인식할 수 있도록 VM option을 추가한다.

IntelliJ Run Configuration → VM options:

```
-Djavax.net.ssl.trustStorePassword=changeit
```

---

## 5. 재발 방지

- JDK를 신규 설치하거나 업데이트할 경우, 루트 CA 재등록 및 VM option 설정이 필요하다.
- 팀 내 다른 개발자도 동일 회사망 환경이라면 같은 설정이 필요하므로, Run Configuration 공유 또는 README에 설정 가이드 추가를 권장한다.
