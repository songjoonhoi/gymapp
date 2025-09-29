package com.example.demo.diet.dto;

import java.time.LocalDateTime;

public record DietLogResponse(
        Long id,
        Long memberId,
        String title,
        String content,
        String previewUrl,
        String mediaType,
        LocalDateTime createdAt
) {}
