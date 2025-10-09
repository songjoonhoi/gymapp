package com.example.demo.membership;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface MembershipLogRepository extends JpaRepository<MembershipLog, Long> {

    // 특정 회원의 가장 최근 등록 기록을 조회하는 메서드
    Optional<MembershipLog> findTopByMemberIdOrderByCreatedAtDesc(Long memberId);

    // ✨ [추가] 특정 회원의 모든 등록 기록을 최신순으로 조회
    List<MembershipLog> findByMemberIdOrderByCreatedAtDesc(Long memberId);
}