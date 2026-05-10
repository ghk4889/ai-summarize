package com.example.summarize;

import java.util.List;

public record SummarizeResult(String summary, List<String> keyPoints, List<String> actions) {}
