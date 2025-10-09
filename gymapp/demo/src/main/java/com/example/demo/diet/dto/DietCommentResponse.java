package com.example.demo.diet.dto;

import com.example.demo.diet.DietComment;
import java.time.LocalDateTime;

public record DietCommentResponse(
        Long id,
        String content,
        Long memberId,
        String memberName,
        LocalDateTime createdAt
) {
    public static DietCommentResponse fromEntity(DietComment comment) {
        return new DietCommentResponse(
                comment.getId(),
                comment.getContent(),
                comment.getMember().getId(),
                comment.getMember().getName(),
                comment.getCreatedAt()
        );
    }
}