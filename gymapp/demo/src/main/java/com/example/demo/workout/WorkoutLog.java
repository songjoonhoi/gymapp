package com.example.demo.workout;

import com.example.demo.common.BaseEntity;
import com.example.demo.member.Member;
import jakarta.persistence.*;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity
@Table(name = "workout_logs")
public class WorkoutLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name="member_id")
    private Member member;

    private String title;     // 오늘 운동 요약
    private String content;   // 상세 메모

    private String mediaUrl;  // 업로드된 사진/영상의 저장 경로
    private String mediaType; // IMAGE / VIDEO
}
