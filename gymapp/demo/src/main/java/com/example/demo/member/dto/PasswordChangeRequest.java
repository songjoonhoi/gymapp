package com.example.demo.member.dto;

import jakarta.validation.constraints.NotBlank;

public record PasswordChangeRequest(
        @NotBlank String currentPassword,
        @NotBlank String newPassword
) {}
