package com.example.demo.member.dto;

import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.Gender;  // ✨ 추가
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDate;  // ✨ 추가

public record MemberCreateRequest(
    @NotBlank String name,
    @NotBlank String phone,
    String email,               // optional
    String password,            // optional
    Gender gender,              // ✨ 추가
    Integer age,                // ✨ 추가
    String membershipType,      // ✨ 추가 (회원권)
    LocalDate registrationDate, // ✨ 추가 (가입일)
    LocalDate startDate,        // ✨ 추가 (시작일)
    Role role
) {}