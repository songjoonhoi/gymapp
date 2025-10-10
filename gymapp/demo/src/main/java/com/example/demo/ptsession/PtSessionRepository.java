package com.example.demo.ptsession;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PtSessionRepository extends JpaRepository<PtSession, Long> {

    // 회원별 PT 세션 조회 (최신순)
    List<PtSession> findByMemberIdOrderBySessionDateDesc(Long memberId);

    // 트레이너별 PT 세션 조회 (최신순)
    List<PtSession> findByTrainerIdOrderBySessionDateDesc(Long trainerId);

    // 특정 기간 회원 PT 세션 조회
    @Query("SELECT p FROM PtSession p WHERE p.member.id = :memberId " +
           "AND p.sessionDate BETWEEN :startDate AND :endDate " +
           "ORDER BY p.sessionDate DESC")
    List<PtSession> findByMemberIdAndDateRange(
            @Param("memberId") Long memberId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    // 회원의 PT 세션 개수
    long countByMemberId(Long memberId);

    // 트레이너의 PT 세션 개수
    long countByTrainerId(Long trainerId);

    // 이번 달 회원 PT 세션 개수
    @Query("SELECT COUNT(p) FROM PtSession p WHERE p.member.id = :memberId " +
           "AND YEAR(p.sessionDate) = :year AND MONTH(p.sessionDate) = :month")
    long countByMemberIdAndMonth(
            @Param("memberId") Long memberId,
            @Param("year") int year,
            @Param("month") int month
    );
}