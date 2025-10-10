package com.example.demo.member.dto;

import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.common.enums.Gender;         // ✨ 추가
import com.example.demo.common.enums.AccountStatus;  // ✨ 추가
import java.time.LocalDateTime;
import java.time.LocalDate;  // ✨ 추가

public record MemberResponse(
    Long id,
    String name,
    String email,
    String phone,
    Role role,
    UserStatus status,
    Gender gender,              // ✨ 추가
    Integer age,                // ✨ 추가
    AccountStatus accountStatus, // ✨ 추가
    String membershipType,      // ✨ 추가
    LocalDate registrationDate, // ✨ 추가
    LocalDate startDate,        // ✨ 추가
    LocalDateTime createdAt,
    LocalDateTime updatedAt,
    Long trainerId
) {}