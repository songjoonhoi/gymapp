package com.example.demo.member;

import com.example.demo.common.enums.UserStatus;
import com.example.demo.common.enums.AccountStatus;  // ✨ 추가
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MemberRepository extends JpaRepository<Member, Long> {
    boolean existsByEmail(String email);
    Optional<Member> findByEmail(String email);
    boolean existsByPhone(String phone);
    
    // ✨ 전화번호로 조회 추가
    Optional<Member> findByPhone(String phone);
    
    long countByStatus(UserStatus status);
    long countByCreatedAtAfter(LocalDateTime date);
    List<Member> findByTrainerId(Long trainerId);
    
    // ✨ PENDING 회원 조회
    List<Member> findByTrainerIdAndAccountStatus(Long trainerId, AccountStatus status);
}