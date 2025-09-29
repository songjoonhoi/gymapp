package com.example.demo.diet;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface DietLogRepository extends JpaRepository<DietLog, Long> {

    // 회원별 조회
    List<DietLog> findByMemberId(Long memberId);

    // 페이지네이션
    Page<DietLog> findAll(Pageable pageable);
}
