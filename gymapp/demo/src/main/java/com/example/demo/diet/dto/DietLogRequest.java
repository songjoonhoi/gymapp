package com.example.demo.diet.dto;

import org.springframework.web.multipart.MultipartFile;

public record DietLogRequest(
        String title,
        String content,
        MultipartFile media
) {}
