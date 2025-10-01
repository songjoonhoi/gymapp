package com.example.demo.member;

import com.example.demo.common.enums.UserStatus;
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
    // 상태별 회원 수 카운트 (ACTIVE, INACTIVE)
    long countByStatus(UserStatus status);

    // 특정 날짜 이후 가입한 회원 수 카운트
    long countByCreatedAtAfter(LocalDateTime date);

    List<Member> findByTrainerId(Long trainerId);

}
