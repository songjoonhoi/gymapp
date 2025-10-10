package com.example.demo.ptsession.dto;

import com.example.demo.ptsession.PtSession;
import java.time.LocalDateTime;

public record PtSessionResponse(
        Long id,
        Long memberId,
        String memberName,
        Long trainerId,
        String trainerName,
        LocalDateTime sessionDate,
        Integer duration,
        String content,
        String memo,
        Boolean isCompleted,
        LocalDateTime createdAt
) {
    public static PtSessionResponse fromEntity(PtSession session) {
        return new PtSessionResponse(
                session.getId(),
                session.getMember().getId(),
                session.getMember().getName(),
                session.getTrainer().getId(),
                session.getTrainer().getName(),
                session.getSessionDate(),
                session.getDuration(),
                session.getContent(),
                session.getMemo(),
                session.getIsCompleted(),
                session.getCreatedAt()
        );
    }
}