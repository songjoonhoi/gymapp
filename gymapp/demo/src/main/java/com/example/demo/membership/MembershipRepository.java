package com.example.demo.membership;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByMemberId(Long memberId);
    List<Membership> findByPtTotalGreaterThan(int zero);
    // ✨ 특정 회원의 가장 최근 등록된 멤버십을 조회하는 메서드 추가
    Optional<Membership> findTopByMemberIdOrderByCreatedAtDesc(Long memberId);
}
