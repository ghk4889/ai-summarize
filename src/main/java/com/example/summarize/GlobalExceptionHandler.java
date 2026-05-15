package com.example.summarize;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.net.SocketTimeoutException;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleStatus(ResponseStatusException e) {
        return ResponseEntity.status(e.getStatusCode())
            .body(Map.of("error", e.getReason() != null ? e.getReason() : "Bad Request"));
    }

    @ExceptionHandler(SocketTimeoutException.class)
    public ResponseEntity<Map<String, String>> handleTimeout(SocketTimeoutException e) {
        log.error("AI 서비스 타임아웃", e);
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
            .body(Map.of("error", "AI 서비스 응답 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException e) {
        log.error("AI 서비스 오류", e);
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body(Map.of("error", "AI 서비스 연동 중 오류가 발생했습니다."));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneral(Exception e) {
        log.error("서버 내부 오류", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", "서버 내부 오류가 발생했습니다."));
    }
}
