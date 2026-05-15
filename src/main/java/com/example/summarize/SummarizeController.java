package com.example.summarize;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class SummarizeController {

    private final ClaudeService claudeService;

    public SummarizeController(ClaudeService claudeService) {
        this.claudeService = claudeService;
    }

    record SummarizeRequest(String text) {}

    @PostMapping("/summarize")
    public SummarizeResult summarize(@RequestBody SummarizeRequest request) throws Exception {
        if (request.text() == null || request.text().isBlank()) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "text must not be empty");
        }
        if (request.text().length() > 500) {
            throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.BAD_REQUEST, "text must not exceed 500 characters");
        }
        return claudeService.summarize(request.text());
    }
}
