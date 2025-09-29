package com.example.demo.auth.dto;

public record AuthResponse(
        String tokenType,   // "Bearer"
        String accessToken,
        Long   memberId,
        String role,
        long   expiresAt    // epoch millis
) {}