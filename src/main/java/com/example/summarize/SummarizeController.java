package com.example.summarize;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class SummarizeController {

    private static final Logger log = LoggerFactory.getLogger(SummarizeController.class);
    private final ClaudeService claudeService;

    public SummarizeController(ClaudeService claudeService) {
        this.claudeService = claudeService;
    }

    record SummarizeRequest(String text) {}

    @PostMapping("/summarize")
    public SummarizeResult summarize(@RequestBody SummarizeRequest request) throws Exception {
        if (request.text() == null || request.text().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text must not be empty");
        }
        if (request.text().length() > 500) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text must not exceed 500 characters");
        }
        log.info("요약 요청: {}", request.text());
        return claudeService.summarize(request.text());
    }

    @PostMapping("/summarize/pdf")
    public SummarizeResult summarizePdf(@RequestParam("file") MultipartFile file) throws Exception {
        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "file must not be empty");
        }
        if (!"application/pdf".equals(file.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "only PDF files are supported");
        }

        String text;
        try (PDDocument doc = Loader.loadPDF(file.getBytes())) {
            text = new PDFTextStripper().getText(doc);
        }

        if (text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "PDF contains no extractable text");
        }
        if (text.length() > 500) {
            text = text.substring(0, 500);
        }

        log.info("PDF 요약 요청: {}자 추출", text.length());
        return claudeService.summarize(text);
    }
}
