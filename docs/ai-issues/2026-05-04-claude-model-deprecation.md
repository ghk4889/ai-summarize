# Claude API 404 오류 — 모델 ID 폐기(Deprecation) 이슈

- 작성일: 2026-05-04
- 프로젝트: AI Document Summarizer
- 환경: Spring Boot, OkHttp, Claude Messages API

---

## 1. 현상

Claude API 호출 시 404 Not Found 응답이 반환되었다.

```
java.lang.RuntimeException: Claude API error: 404
```

API 키, 네트워크, SSL 설정은 모두 정상이었으며, 요청 형식에도 문제가 없었다.

---

## 2. 원인

### 2.1 AI의 실수

프로젝트 초기 구성 시 AI에게 Claude API 연동 코드를 작성하도록 요청했다. AI가 생성한 코드에 `claude-3-5-haiku-20241022` 모델 ID가 하드코딩되어 있었으나, 해당 모델은 이미 폐기(deprecated)된 상태였다.

AI는 학습 데이터 시점에서 유효했던 모델 ID를 사용했으며, **현재 시점의 모델 폐기 여부를 확인하지 못한 것**이 근본 원인이다.

### 2.2 API 동작

Anthropic은 Claude 4 세대 출시와 함께 기존 3.x 모델을 순차적으로 폐기하고 있으며, 폐기된 모델 ID로 요청하면 404를 반환한다.

| 항목 | 값 |
|------|-----|
| AI가 생성한 모델 ID | `claude-3-5-haiku-20241022` (폐기됨) |
| 현재 유효한 모델 ID | `claude-haiku-4-5-20251001` |

---

## 3. 해결

`ClaudeService.java`의 모델 ID를 현재 유효한 버전으로 변경했다.

```
// 변경 전
"model", "claude-3-5-haiku-20241022"

// 변경 후
"model", "claude-haiku-4-5-20251001"
```

---

## 4. 교훈

- AI API의 모델 ID는 **영구적이지 않다.** 제공사의 폐기 정책에 따라 언제든 404가 발생할 수 있다.
- 모델 ID를 코드에 하드코딩하면 폐기 시 코드 수정 및 재배포가 필요하다.
- `application.properties` 등 외부 설정으로 분리하면 코드 변경 없이 대응할 수 있다.
- Anthropic의 [모델 폐기 문서](https://docs.anthropic.com/en/docs/about-claude/model-deprecations)를 주기적으로 확인하는 것을 권장한다.
