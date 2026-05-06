# Claude API JSON 응답에 마크다운 코드블록이 포함되는 이슈

- 작성일: 2026-05-06
- 프로젝트: AI Document Summarizer
- 환경: Spring Boot, Claude Messages API (claude-haiku-4-5-20251001)

---

## 1. 현상

Claude에게 "JSON만 응답하라"고 system 프롬프트로 지시했으나, 실제 응답이 마크다운 코드블록으로 감싸져 반환됨.

```
`​`​`json
{"summary":"...","keyPoints":[...],"actions":[...]}
`​`​`
```

Jackson `ObjectMapper.readValue()`에서 첫 문자가 `` ` ``(backtick)이라 `JsonParseException` 발생.

```
com.fasterxml.jackson.core.JsonParseException: Unexpected character ('`' (code 96))
```

---

## 2. 원인

Claude는 프롬프트에서 "no markdown" 이라고 지시해도, JSON 응답을 코드블록으로 감싸는 경향이 있다. 특히 짧은 system 프롬프트나 모호한 지시에서 이 현상이 자주 발생한다.

---

## 3. 해결

JSON 파싱 전에 마크다운 코드블록 감싸기를 제거하는 로직 추가.

```java
content = content.strip();
if (content.startsWith("```")) {
    content = content.replaceFirst("```(?:json)?\\s*", "");
    content = content.replaceFirst("\\s*```$", "");
}
return mapper.readValue(content, SummarizeResult.class);
```

---

## 4. 교훈

- LLM의 출력 형식은 100% 보장되지 않는다. 프롬프트로 제어하더라도 방어 코드가 필요하다.
- JSON 파싱 전 전처리(trim, 코드블록 제거)는 LLM 연동 시 기본 패턴으로 가져가는 게 좋다.
