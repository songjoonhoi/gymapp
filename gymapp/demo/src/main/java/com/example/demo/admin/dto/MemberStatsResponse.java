package com.example.demo.admin.dto;

import java.time.LocalDateTime;

public record MemberStatsResponse(
        Long memberId,
        String name,
        long workoutCount,
        long dietCount,
        long totalLogs,
        LocalDateTime lastLogAt
) {}
