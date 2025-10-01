package com.example.demo.diet.dto;

import java.time.LocalDateTime;

public record DietLogResponse(
        Long id,
        Long memberId,
        String title,
        String content,
        String mediaUrl,
        String mediaType,
        Integer calories,   // ✅ 칼로리 저장
        String aiCalories,   // ✅ 추가
        String aiNutrition,  // ✅ 추가
        LocalDateTime createdAt
) {}
