package com.example.demo.stats.dto;

public record MemberLogsStatsResponse(
        LogStatsResponse dietStats,
        LogStatsResponse workoutStats
) {}
