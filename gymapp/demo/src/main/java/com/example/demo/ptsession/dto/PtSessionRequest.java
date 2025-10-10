package com.example.demo.ptsession.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.time.LocalDateTime;

public record PtSessionRequest(
        @NotNull Long memberId,     // PT 받을 회원 ID
        @NotNull LocalDateTime sessionDate,  // PT 일시
        @NotNull @Positive Integer duration, // 소요 시간 (분)
        String content,              // 운동 내용
        String memo                  // 트레이너 메모
) {}