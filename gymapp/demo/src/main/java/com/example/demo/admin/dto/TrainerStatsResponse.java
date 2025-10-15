package com.example.demo.admin.dto;

public record TrainerStatsResponse(
        Long trainerId,
        String trainerName,
        Long traineeCount
) {}