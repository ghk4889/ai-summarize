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

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${claude.api.key}")
    private String apiKey;

    public String summarize(String text) throws Exception {
        Map<String, Object> body = Map.of(
            "model", "claude-3-5-haiku-20241022",
            "max_tokens", 1024,
            "messages", List.of(
                Map.of("role", "user", "content", "Summarize the following text concisely:\n\n" + text)
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
            return (String) ((Map<?, ?>) ((List<?>) result.get("content")).get(0)).get("text");
        }
    }
}
