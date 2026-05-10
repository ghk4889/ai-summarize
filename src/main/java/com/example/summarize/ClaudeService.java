package com.example.summarize;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final MediaType JSON = MediaType.get("application/json");

    private static final String SYSTEM_PROMPT = """
            You are a document summarizer. Analyze the given text and respond with ONLY a JSON object in this exact format:
            {"summary":"A concise 2-3 sentence summary","keyPoints":["key point 1","key point 2","key point 3"],"actions":["action item 1","action item 2"]}
            Rules: summary is a brief overview. keyPoints are the most important facts (3-5 items). actions are actionable next steps if any (0-3 items, empty array if none). Respond with ONLY the JSON, no markdown or explanation.""";

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${claude.api.key}")
    private String apiKey;

    public SummarizeResult summarize(String text) throws Exception {
        Map<String, Object> body = Map.of(
            "model", "claude-haiku-4-5-20251001",
            "max_tokens", 1024,
            "system", SYSTEM_PROMPT,
            "messages", List.of(
                Map.of("role", "user", "content", text)
            )
        );

        Request request = new Request.Builder()
            .url(API_URL)
            .post(RequestBody.create(mapper.writeValueAsString(body), JSON))
            .header("x-api-key", apiKey)
            .header("anthropic-version", "2023-06-01")
            .header("content-type", "application/json")
            .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) throw new RuntimeException("Claude API error: " + response.code());
            Map<?, ?> result = mapper.readValue(response.body().string(), Map.class);
            String content = (String) ((Map<?, ?>) ((List<?>) result.get("content")).getFirst()).get("text");
            // Claude가 마크다운 코드블록으로 감쌀 수 있으므로 제거
            content = content.strip();
            if (content.startsWith("```")) {
                content = content.replaceFirst("```(?:json)?\\s*", "");
                content = content.replaceFirst("\\s*```$", "");
            }
            return mapper.readValue(content, SummarizeResult.class);
        }
    }
}
