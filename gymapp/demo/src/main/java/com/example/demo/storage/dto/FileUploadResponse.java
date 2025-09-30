package com.example.demo.storage.dto;

public record FileUploadResponse(
        String url,      // 저장된 파일 접근 URL
        String filename, // 원본 파일명
        String type      // MIME 타입
) {}
