# Java trustStorePassword를 여러 곳에 설정해야 하는 이유

- 작성일: 2026-05-20
- 프로젝트: AI Document Summarizer
- 환경: Windows, JDK 21, IntelliJ IDEA, Gradle

---

## 1. 배경

Day 2에서 회사 프록시 인증서를 `keytool`로 등록한 이후, cacerts 파일이 비밀번호 보호 상태로 변경되었다. 이후 HTTPS 통신이 필요한 곳마다 `-Djavax.net.ssl.trustStorePassword=changeit`을 설정해야 했다.

---

## 2. 왜 한 번에 안 되는가

같은 JDK의 같은 cacerts 파일을 사용하지만, **Java를 실행하는 주체가 각각 독립된 JVM 프로세스**이기 때문이다.

```
JDK 21 (cacerts 비밀번호 잠김)
    ├── IntelliJ Run (Spring Boot 앱 실행) → 별도 JVM 프로세스
    ├── Gradle Daemon (의존성 다운로드) → 별도 JVM 프로세스
    └── Docker 컨테이너 → 완전히 다른 환경의 JVM
```

하나에 비밀번호를 알려줘도 다른 프로세스는 모른다.

---

## 3. 각 설정 위치와 역할

| 상황 | 설정 위치 | 적용 대상 |
|------|----------|----------|
| Spring Boot 앱 실행 | IntelliJ Run Configuration → VM options | 앱이 Claude API 호출할 때 |
| Gradle 의존성 다운로드 | `gradle.properties` → `org.gradle.jvmargs` | Gradle이 Maven Central에서 JAR 받을 때 |
| Docker 컨테이너 | Dockerfile ENTRYPOINT | 컨테이너 안에서 앱 실행할 때 |

---

## 4. 각 설정 방법

### IntelliJ Run Configuration

```
Run → Edit Configurations → VM options:
-Djavax.net.ssl.trustStorePassword=changeit
```

### gradle.properties (프로젝트 루트)

```properties
org.gradle.jvmargs=-Djavax.net.ssl.trustStorePassword=changeit
```

### Docker (이미 ENTRYPOINT에서 처리됨)

```dockerfile
java -Djavax.net.ssl.trustStorePassword=changeit -jar app.jar
```

---

## 5. 전역 해결 방법 (비권장)

시스템 환경변수에 설정하면 모든 Java 프로세스에 적용:

```
JAVA_TOOL_OPTIONS=-Djavax.net.ssl.trustStorePassword=changeit
```

비권장 이유: 시스템 전역 설정이라 다른 Java 프로그램에 영향을 줄 수 있음.

---

## 6. 근본 원인 요약

```
[JDK 설치 직후]  cacerts → 비밀번호 없이 읽기 가능
       ↓  keytool -import -storepass changeit 실행
[keytool 이후]   cacerts → 비밀번호 필수 (keytool의 부작용)
       ↓
모든 JVM 프로세스에서 trustStorePassword를 명시해야 함
```

원복하려면 JDK 재설치 필요.
