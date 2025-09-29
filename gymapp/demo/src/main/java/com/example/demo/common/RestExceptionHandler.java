package com.example.demo.common;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.Map;

@ControllerAdvice
public class RestExceptionHandler {

    private ResponseEntity<Map<String,Object>> body(HttpStatus s, String code, String msg, String path) {
        return ResponseEntity.status(s).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", s.value(),
                "code", code,
                "message", msg,
                "path", path
        ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArg(IllegalArgumentException e) {
        return body(HttpStatus.BAD_REQUEST, "BAD_REQUEST", e.getMessage(), "");
    }

    @ExceptionHandler({EntityNotFoundException.class})
    public ResponseEntity<?> handleNotFound(EntityNotFoundException e) {
        return body(HttpStatus.NOT_FOUND, "NOT_FOUND", e.getMessage(), "");
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class})
    public ResponseEntity<?> handleValidation(Exception e) {
        return body(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", e.getMessage(), "");
    }
}
