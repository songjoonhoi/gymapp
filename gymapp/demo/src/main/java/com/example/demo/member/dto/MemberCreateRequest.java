package com.example.demo.member.dto;

import com.example.demo.common.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record MemberCreateRequest(
    @NotBlank String name,
    @Email @NotBlank String email,
    String phone,
    Role role) {

    
    
}
