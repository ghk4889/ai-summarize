package com.example.summarize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SummarizeController {

    record SummarizeRequest(String text) {}
    record SummarizeResponse(String summary) {}

    @PostMapping("/summarize")
    public SummarizeResponse summarize(@RequestBody SummarizeRequest request) {
        // TODO: replace with real summarization logic
        String summary = request.text().length() > 100
            ? request.text().substring(0, 100) + "..."
            : request.text();
        return new SummarizeResponse(summary);
    }
}
