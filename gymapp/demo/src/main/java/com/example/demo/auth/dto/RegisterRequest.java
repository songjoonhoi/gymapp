package com.example.demo.auth.dto;

public record RegisterRequest(
        String name,
        String phone,
        String email,
        String password
) {}
