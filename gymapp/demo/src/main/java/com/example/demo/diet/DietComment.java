package com.example.demo.diet;

import com.example.demo.common.BaseEntity;
import com.example.demo.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "diet_comment")
public class DietComment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "diet_log_id", nullable = false)
    private DietLog dietLog;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member; // 댓글 작성자

    @Builder
    public DietComment(String content, DietLog dietLog, Member member) {
        this.content = content;
        this.dietLog = dietLog;
        this.member = member;
    }
}