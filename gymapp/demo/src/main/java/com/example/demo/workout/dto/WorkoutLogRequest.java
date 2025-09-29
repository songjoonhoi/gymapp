package com.example.demo.workout.dto;

import org.springframework.web.multipart.MultipartFile;

public record WorkoutLogRequest(
        String title,
        String content,
        MultipartFile media
) {}
