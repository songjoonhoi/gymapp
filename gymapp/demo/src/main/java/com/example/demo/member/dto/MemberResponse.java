package com.example.demo.member.dto;

import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;

import java.time.LocalDateTime;

public record MemberResponse(
        Long id, String name, String email, String phone,
        Role role, UserStatus status,
        LocalDateTime createdAt, LocalDateTime updatedAt
) {}
