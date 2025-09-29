package com.example.demo.workout;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface WorkoutLogRepository extends JpaRepository<WorkoutLog, Long> {

    // 회원별 조회 (service.listByMember 에서 사용)
    List<WorkoutLog> findByMemberId(Long memberId);

    // 페이지네이션 (JpaRepository 에 기본 제공이지만 명시해도 OK)
    Page<WorkoutLog> findAll(Pageable pageable);
}
