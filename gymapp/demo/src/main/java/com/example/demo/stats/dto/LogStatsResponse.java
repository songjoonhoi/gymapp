package com.example.demo.stats.dto;

import java.time.LocalDateTime;
import java.util.Map;

public record LogStatsResponse(
        Long memberId,
        long totalCount,
        LocalDateTime lastCreatedAt,
        Map<String, Long> mediaTypeCount
) {}
