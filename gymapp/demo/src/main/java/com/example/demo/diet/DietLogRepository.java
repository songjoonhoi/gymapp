package com.example.demo.diet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DietLogRepository extends JpaRepository<DietLog, Long> {

    List<DietLog> findByMemberId(Long memberId);

    // 🔍 검색/필터링
    @Query("""
        SELECT l FROM DietLog l
        WHERE (:keyword IS NULL OR l.title LIKE %:keyword% OR l.content LIKE %:keyword%)
          AND (:memberId IS NULL OR l.member.id = :memberId)
          AND (:fromDate IS NULL OR l.createdAt >= :fromDate)
          AND (:toDate IS NULL OR l.createdAt <= :toDate)
          AND (:mediaType IS NULL OR l.mediaType = :mediaType)
    """)
    Page<DietLog> search(
            @Param("keyword") String keyword,
            @Param("memberId") Long memberId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("mediaType") String mediaType,
            Pageable pageable
    );

    // 📊 통계 API
    long countByMemberId(Long memberId);

    @Query("SELECT MAX(d.createdAt) FROM DietLog d WHERE d.member.id = :memberId")
    LocalDateTime findLastCreatedAt(Long memberId);

    @Query("SELECT d.mediaType, COUNT(d) FROM DietLog d WHERE d.member.id = :memberId GROUP BY d.mediaType")
    List<Object[]> countByMediaType(Long memberId);

    @Query("SELECT MAX(d.createdAt) FROM DietLog d WHERE d.member.id = :memberId")
    LocalDateTime findLastCreatedAtByMemberId(Long memberId);

    // 전체 합계
    @Query("SELECT COALESCE(SUM(d.calories), 0) FROM DietLog d WHERE d.member.id = :memberId")
    int findTotalCalories(@Param("memberId") Long memberId);

    // 기간별 합계
    @Query("SELECT COALESCE(SUM(d.calories), 0) FROM DietLog d " +
           "WHERE d.member.id = :memberId AND d.createdAt BETWEEN :start AND :end")
    int findCaloriesBetween(
            @Param("memberId") Long memberId,
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end
    );
}
