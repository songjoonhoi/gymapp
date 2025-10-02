package com.example.demo.auth.dto;

import com.example.demo.common.enums.Role;

public record AuthResponse(
        String tokenType,
        String accessToken,
        Long memberId,
        Role role,      // ✅ String → Role Enum
        long expiresAt
) {}
