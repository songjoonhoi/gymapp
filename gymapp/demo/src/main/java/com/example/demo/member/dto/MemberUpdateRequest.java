package com.example.demo.member.dto;

import com.example.demo.common.enums.Role;

public record MemberUpdateRequest(
        String name,
        String phone,
        Role role
) {}
