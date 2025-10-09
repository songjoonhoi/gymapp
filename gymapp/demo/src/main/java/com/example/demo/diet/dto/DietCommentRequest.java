package com.example.demo.diet.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DietCommentRequest(
        @NotBlank(message = "댓글 내용은 필수입니다.")
        @Size(max = 1000, message = "댓글은 1000자를 넘을 수 없습니다.")
        String content
) {
}