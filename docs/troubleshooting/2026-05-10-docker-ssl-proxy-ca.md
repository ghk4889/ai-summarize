# Docker 컨테이너 SSL 인증서 문제 — 프록시 CA 불일치

- 작성일: 2026-05-10
- 프로젝트: AI Document Summarizer
- 환경: Docker (eclipse-temurin:21-jre), WSL2, 회사 내부망

---

## 1. 현상

Docker 컨테이너에서 Claude API 호출 시 SSL 핸드셰이크 실패.

```
SSLHandshakeException: PKIX path building failed: unable to find valid certification path to requested target
```

---

## 2. 원인

### 2.1 인증서 불일치

프로젝트에 있던 `.devcontainer/root_ca.crt`를 "프록시 인증서"로 가정하고 등록했으나, 실제 프록시 인증서와 달랐다.

| 항목 | 등록한 인증서 | 실제 프록시 인증서 |
|------|-------------|-----------------|
| Subject | CN=OldProxy Certificate | CN=ProxySSL, O=Security Corp |

### 2.2 왜 다른 인증서였나

회사 프록시 장비가 변경되었으나, 프로젝트에 포함된 인증서 파일은 이전 프록시의 것이 그대로 남아있었다. 파일명만 보고 "이게 현재 프록시 인증서"라고 가정한 것이 실수.

### 2.3 Day 2 SSL 문제와의 차이

| | Day 2 (로컬 JDK) | Day 5 (Docker) |
|---|---|---|
| 환경 | Windows, IntelliJ | Docker (WSL2) |
| 원인 | 맞는 인증서를 등록했지만 cacerts 비밀번호 상태가 깨짐 | 잘못된(오래된) 인증서를 등록함 |
| 에러 | `trustAnchors must be non-empty` | `PKIX path building failed` |
| 해결 | JVM 옵션으로 비밀번호 명시 | 런타임 자동 추출 방식으로 전환 |

### 2.2 확인 방법

```bash
# 실제 프록시가 제시하는 인증서 확인
echo | openssl s_client -connect api.anthropic.com:443 2>/dev/null | openssl x509 -noout -issuer

# 등록한 인증서 확인
openssl x509 -in .devcontainer/root_ca.crt -noout -subject -issuer
```

---

## 3. 해결

Dockerfile ENTRYPOINT에서 런타임에 프록시 인증서를 자동 추출/등록:

```dockerfile
ENTRYPOINT ["sh", "-c", "echo | openssl s_client -connect api.anthropic.com:443 2>/dev/null | openssl x509 -out /tmp/proxy_ca.crt && keytool -import -alias proxy-ca -keystore $JAVA_HOME/lib/security/cacerts -storepass changeit -file /tmp/proxy_ca.crt -noprompt 2>/dev/null; java -Djavax.net.ssl.trustStorePassword=changeit -jar app.jar"]
```

---

## 4. 장점

- 인증서 파일 관리 불필요
- 프록시가 변경되어도 자동 대응
- 외부망(프록시 없는 환경)에서도 무해하게 동작

## 5. 단점

- 컨테이너 시작 시 외부 네트워크 연결이 필요 (오프라인 환경에서는 인증서 추출 실패)
- 시작 시간이 1~2초 느려짐
- MITM(중간자 공격) 환경에서 악의적 인증서를 자동 신뢰할 수 있음 (보안 민감 환경에서는 부적절)
- `api.anthropic.com` 주소가 Dockerfile에 하드코딩됨

### 허용 가능한 이유

- 이 서비스는 Claude API 호출이 핵심이므로 네트워크 연결은 어차피 필수
- 1~2초 지연은 컨테이너 시작 시 1회뿐이라 서비스 영향 없음
- 회사 내부망 프록시가 원인이며, 운영 배포 환경에서는 프록시가 없을 가능성이 높음 (프록시 없으면 인증서 추출이 무해하게 실패하고 기본 cacerts로 정상 동작)
- 2주 개인 프로젝트 규모에서 보안 민감도가 낮음

---

## 5. 교훈

- Docker 컨테이너의 네트워크 경로는 호스트와 다를 수 있다.
- 인증서를 등록하기 전에 `openssl s_client`로 실제 제시되는 인증서를 먼저 확인할 것.
- 정적 인증서 파일보다 런타임 자동 추출이 유지보수에 유리하다.
