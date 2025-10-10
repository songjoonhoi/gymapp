package com.example.demo.auth.dto;

import com.example.demo.common.enums.Gender;  // ✨ 추가

public record RegisterRequest(
    String name,
    String phone,
    String email,        // optional
    String password,     // optional
    Gender gender,       // ✨ 추가
    Integer age,         // ✨ 추가
    Long trainerId       // ✨ 추가 (담당 트레이너 선택)
) {}