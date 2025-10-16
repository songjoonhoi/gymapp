package com.example.demo.member.dto;

import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.Gender;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;

public record MemberCreateRequest(
    @NotBlank String name,
    @NotBlank String phone,
    String email,               // optional
    String password,            // optional
    Gender gender,
    LocalDate dateOfBirth,
    String membershipType,
    LocalDate registrationDate,
    LocalDate startDate,
    Role role,
    Long trainerId              // ✨ 추가!
) {}