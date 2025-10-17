package com.example.demo.member;

import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.common.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface MemberRepository extends JpaRepository<Member, Long> {
    
    // ✅ 이메일 중복 체크 (삭제된 회원 제외)
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Member m WHERE m.email = :email AND m.deletedAt IS NULL")
    boolean existsByEmail(@Param("email") String email);
    
    Optional<Member> findByEmail(String email);
    
    // ✅ 전화번호 중복 체크 (삭제된 회원 제외)
    @Query("SELECT CASE WHEN COUNT(m) > 0 THEN true ELSE false END FROM Member m WHERE m.phone = :phone AND m.deletedAt IS NULL")
    boolean existsByPhone(@Param("phone") String phone);
    
    Optional<Member> findByPhone(String phone);
    
    // ✅ 통계용 카운트
    long countByStatus(UserStatus status);
    long countByCreatedAtAfter(LocalDateTime date);
    
    // ✅ 트레이너 관련
    List<Member> findByTrainerId(Long trainerId);
    List<Member> findByTrainerIdAndAccountStatus(Long trainerId, AccountStatus status);
    
    // ✨ 역할별 조회 추가
    List<Member> findByRole(Role role);
    
    // ✅ 하드 삭제용 메서드 (Soft Delete 우회)
    @Modifying
    @Query(value = "DELETE FROM members WHERE id = :id", nativeQuery = true)
    void hardDelete(@Param("id") Long id);
}