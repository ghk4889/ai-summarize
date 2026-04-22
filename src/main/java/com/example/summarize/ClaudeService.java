package com.example.summarize;

import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;

import javax.net.ssl.*;
import java.security.KeyStore;
import java.util.List;
import java.util.Map;

@Service
public class ClaudeService {

    private static final String API_URL = "https://api.anthropic.com/v1/messages";
    private static final MediaType JSON = MediaType.get("application/json");

    private final OkHttpClient client = createClient();
    private final ObjectMapper mapper = new ObjectMapper();

    private static OkHttpClient createClient() {
        try {
            String cacertsPath = System.getProperty("java.home") + "/lib/security/cacerts";
            KeyStore trustStore = KeyStore.getInstance(KeyStore.getDefaultType());
            try (java.io.FileInputStream fis = new java.io.FileInputStream(cacertsPath)) {
                trustStore.load(fis, "changeit".toCharArray());
            }
            TrustManagerFactory tmf = TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm());
            tmf.init(trustStore);
            SSLContext sslContext = SSLContext.getInstance("TLS");
            sslContext.init(null, tmf.getTrustManagers(), null);
            return new OkHttpClient.Builder()
                .sslSocketFactory(sslContext.getSocketFactory(), (X509TrustManager) tmf.getTrustManagers()[0])
                .build();
        } catch (Exception e) {
            throw new RuntimeException("SSL 컨텍스트 초기화 실패", e);
        }
    }

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
