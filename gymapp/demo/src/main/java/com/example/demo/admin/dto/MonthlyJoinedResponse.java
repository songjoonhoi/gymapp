package com.example.demo.admin.dto;

public record MonthlyJoinedResponse(
        Integer month,
        Long count
) {}