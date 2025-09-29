package com.example.demo.membership;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByMemberId(Long memberId);
    List<Membership> findByPtTotalGreaterThan(int zero);
}
