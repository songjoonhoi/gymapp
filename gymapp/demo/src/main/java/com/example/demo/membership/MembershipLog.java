package com.example.demo.membership;

import com.example.demo.common.BaseEntity;
import com.example.demo.member.Member;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MembershipLog extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    private int ptSessionCount;      // 이번에 등록한 정규 세션 수
    private int serviceSessionCount; // 이번에 등록한 서비스 세션 수
    private int paymentAmount;       // 이번 결제 금액
    private LocalDate startDate;     // 시작일
    private LocalDate endDate;       // 종료일

    @Builder
    public MembershipLog(Member member, int ptSessionCount, int serviceSessionCount, int paymentAmount, LocalDate startDate, LocalDate endDate) {
        this.member = member;
        this.ptSessionCount = ptSessionCount;
        this.serviceSessionCount = serviceSessionCount;
        this.paymentAmount = paymentAmount;
        this.startDate = startDate;
        this.endDate = endDate;
    }
}