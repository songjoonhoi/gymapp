package com.example.demo.workout;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {

    List<WorkoutLog> findByMemberId(Long memberId);

    // 🔍 검색/필터링
    @Query("""
        SELECT l FROM WorkoutLog l
        WHERE (:keyword IS NULL OR l.title LIKE %:keyword% OR l.content LIKE %:keyword%)
          AND (:memberId IS NULL OR l.member.id = :memberId)
          AND (:fromDate IS NULL OR l.createdAt >= :fromDate)
          AND (:toDate IS NULL OR l.createdAt <= :toDate)
          AND (:mediaType IS NULL OR l.mediaType = :mediaType)
    """)
    Page<WorkoutLog> search(
            @Param("keyword") String keyword,
            @Param("memberId") Long memberId,
            @Param("fromDate") LocalDateTime fromDate,
            @Param("toDate") LocalDateTime toDate,
            @Param("mediaType") String mediaType,
            Pageable pageable
    );

    // 📊 통계 API
    long countByMemberId(Long memberId);

    @Query("SELECT MAX(w.createdAt) FROM WorkoutLog w WHERE w.member.id = :memberId")
    LocalDateTime findLastCreatedAt(Long memberId);

    @Query("SELECT w.mediaType, COUNT(w) FROM WorkoutLog w WHERE w.member.id = :memberId GROUP BY w.mediaType")
    List<Object[]> countByMediaType(Long memberId);

    @Query("SELECT MAX(w.createdAt) FROM WorkoutLog w WHERE w.member.id = :memberId")
    LocalDateTime findLastCreatedAtByMemberId(Long memberId);
}
