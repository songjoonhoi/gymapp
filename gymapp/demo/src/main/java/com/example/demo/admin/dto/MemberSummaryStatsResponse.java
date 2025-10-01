package com.example.demo.admin.dto;

public record MemberSummaryStatsResponse(
        long totalMembers,
        long activeMembers,
        long inactiveMembers,
        long recentJoined
) {}
