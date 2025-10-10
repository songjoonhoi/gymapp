package com.example.demo.admin;

import com.example.demo.common.enums.UserStatus;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.admin.dto.MemberStatsResponse;
import com.example.demo.admin.dto.MemberSummaryStatsResponse;
import com.example.demo.workout.WorkoutLogRepository;
import com.example.demo.diet.DietLogRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.auth.UserPrincipal; 
import com.example.demo.common.enums.Role; 
import org.springframework.security.access.AccessDeniedException; 
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder; 

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final MemberRepository memberRepo;
    private final WorkoutLogRepository workoutLogRepo;
    private final DietLogRepository dietLogRepo;

    //  회원 등급 변경 (PT 등급업)
    public void updateMemberRole(Long memberId, Role newRole, UserPrincipal currentUser) {
        if (!currentUser.isAdmin() && !currentUser.isTrainer()) {
            throw new AccessDeniedException("회원 등급을 수정할 권한이 없습니다.");
        }

        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + memberId));

        // 트레이너는 자신의 담당 회원 등급만 변경 가능하도록 제한 (선택적)
        if (currentUser.isTrainer() && !currentUser.isAdmin()) {
            if (member.getTrainer() == null || !member.getTrainer().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("자신의 담당 회원이 아닙니다.");
            }
        }
        
        member.setRole(newRole);
    }


    // ✅ 모든 회원 조회
    public List<MemberResponse> getAllMembers() {
    return memberRepo.findAll().stream()
            .map(m -> new MemberResponse(
                    m.getId(),
                    m.getName(),
                    m.getEmail(),
                    m.getPhone(),
                    m.getRole(),
                    m.getStatus(),
                    m.getGender(),              // ✨ 추가
                    m.getAge(),                 // ✨ 추가
                    m.getAccountStatus(),       // ✨ 추가
                    m.getMembershipType(),      // ✨ 추가
                    m.getRegistrationDate(),    // ✨ 추가
                    m.getStartDate(),           // ✨ 추가
                    m.getCreatedAt(),
                    m.getUpdatedAt(),
                    m.getTrainer() != null ? m.getTrainer().getId() : null
            ))
            .toList();
}

    // ✅ 회원 상태 변경 (ACTIVE ↔ INACTIVE)
    public void changeMemberStatus(Long memberId, String status) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + memberId));

        member.setStatus(UserStatus.valueOf(status.toUpperCase()));
    }

    // ✅ 강제 회원 삭제
    public void deleteMember(Long memberId) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + memberId));
        memberRepo.delete(member);
    }

    // ✅ 전체 회원 요약 통계
    public MemberSummaryStatsResponse getMemberSummaryStats() {
        long total = memberRepo.count();  
        long active = memberRepo.countByStatus(UserStatus.ACTIVE);  
        long inactive = memberRepo.countByStatus(UserStatus.INACTIVE);  
        long recent = memberRepo.countByCreatedAtAfter(LocalDateTime.now().minusDays(7));

        return new MemberSummaryStatsResponse(total, active, inactive, recent);
    }

    // ✅ 회원별 로그 통계
    public List<MemberStatsResponse> getMemberLogStats() {
        return memberRepo.findAll().stream()
                .map(m -> {
                    long workoutCount = workoutLogRepo.countByMemberId(m.getId());
                    long dietCount = dietLogRepo.countByMemberId(m.getId());
                    long totalLogs = workoutCount + dietCount;

                    // 최근 작성일 찾기
                    LocalDateTime lastWorkout = workoutLogRepo.findLastCreatedAtByMemberId(m.getId());
                    LocalDateTime lastDiet = dietLogRepo.findLastCreatedAtByMemberId(m.getId());
                    LocalDateTime lastLogAt = null;

                    if (lastWorkout != null && lastDiet != null) {
                        lastLogAt = lastWorkout.isAfter(lastDiet) ? lastWorkout : lastDiet;
                    } else if (lastWorkout != null) {
                        lastLogAt = lastWorkout;
                    } else if (lastDiet != null) {
                        lastLogAt = lastDiet;
                    }

                    return new MemberStatsResponse(
                            m.getId(),
                            m.getName(),
                            workoutCount,
                            dietCount,
                            totalLogs,
                            lastLogAt
                    );
                })
                .toList();
    }
}
