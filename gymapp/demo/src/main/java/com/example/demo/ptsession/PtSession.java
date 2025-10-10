package com.example.demo.ptsession;

import com.example.demo.common.BaseEntity;
import com.example.demo.member.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "pt_sessions")
public class PtSession extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;  // PT 받는 회원

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id", nullable = false)
    private Member trainer;  // PT 진행 트레이너

    @Column(nullable = false)
    private LocalDateTime sessionDate;  // PT 일시

    @Column(nullable = false)
    private Integer duration;  // 소요 시간 (분)

    @Column(columnDefinition = "TEXT")
    private String content;  // 운동 내용 (상세 기록)

    @Column(columnDefinition = "TEXT")
    private String memo;  // 트레이너 메모 (회원에게 보이지 않음)

    @Column(nullable = false)
    @Builder.Default
    private Boolean isCompleted = true;  // 완료 여부 (기본 true)
}