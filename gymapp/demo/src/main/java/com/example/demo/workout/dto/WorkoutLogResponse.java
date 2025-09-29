package com.example.demo.workout.dto;

import java.time.LocalDateTime;

public record WorkoutLogResponse(
        Long id,
        Long memberId,
        String title,
        String content,
        String mediaPreviewUrl, // 미리보기용 URL (마스킹 처리)
        String mediaType,
        LocalDateTime createdAt
) {}
