package com.example.demo.admin;

import com.example.demo.common.enums.UserStatus;
import com.example.demo.common.enums.Role;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.admin.dto.MemberStatsResponse;
import com.example.demo.admin.dto.MemberSummaryStatsResponse;
import com.example.demo.admin.dto.TrainerStatsResponse;
import com.example.demo.admin.dto.AllStatsResponse;
import com.example.demo.admin.dto.MonthlyJoinedResponse;
import com.example.demo.workout.WorkoutLogRepository;
import com.example.demo.diet.DietLogRepository;
import com.example.demo.ptsession.PtSessionRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.demo.auth.UserPrincipal;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final MemberRepository memberRepo;
    private final WorkoutLogRepository workoutLogRepo;
    private final DietLogRepository dietLogRepo;
    private final PtSessionRepository ptSessionRepo;
    private final PasswordEncoder passwordEncoder;

    // ✅ 회원 등급 변경 (PT 등급업)
    public void updateMemberRole(Long memberId, Role newRole, UserPrincipal currentUser) {
        if (!currentUser.isAdmin() && !currentUser.isTrainer()) {
            throw new AccessDeniedException("회원 등급을 수정할 권한이 없습니다.");
        }

        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + memberId));

        // 트레이너는 자신의 담당 회원 등급만 변경 가능하도록 제한
        if (currentUser.isTrainer() && !currentUser.isAdmin()) {
            if (member.getTrainer() == null || !member.getTrainer().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("자신의 담당 회원이 아닙니다.");
            }
        }
        
        member.setRole(newRole);
    }

    // ✅ 모든 회원 조회
    @Transactional(readOnly = true)
    public List<MemberResponse> getAllMembers() {
        return memberRepo.findAll().stream()
                .map(this::toMemberResponse)
                .toList();
    }

    // ✅ 모든 트레이너 조회
    @Transactional(readOnly = true)
    public List<MemberResponse> getAllTrainers() {
        return memberRepo.findAll().stream()
                .filter(m -> m.getRole().isTrainer())
                .map(this::toMemberResponse)
                .toList();
    }

    // ✅ 회원 상태 변경 (ACTIVE ↔ INACTIVE)
    public void changeMemberStatus(Long memberId, String status) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + memberId));
        member.setStatus(UserStatus.valueOf(status.toUpperCase()));
    }

    // ✅ 회원 삭제
    public void deleteMember(Long memberId) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + memberId));
        
        // 관리자 자신은 삭제 불가
        if (member.getRole() == Role.ADMIN) {
            throw new IllegalArgumentException("관리자 계정은 삭제할 수 없습니다.");
        }
        
        memberRepo.delete(member);
    }

    // ✅ 전체 회원 요약 통계
    @Transactional(readOnly = true)
    public MemberSummaryStatsResponse getMemberSummaryStats() {
        long total = memberRepo.count();
        long active = memberRepo.countByStatus(UserStatus.ACTIVE);
        long inactive = memberRepo.countByStatus(UserStatus.INACTIVE);
        long recent = memberRepo.countByCreatedAtAfter(LocalDateTime.now().minusDays(7));
        return new MemberSummaryStatsResponse(total, active, inactive, recent);
    }

    // ✅ 전체 통계
    @Transactional(readOnly = true)
    public AllStatsResponse getAllStats() {
        // 기본 통계
        long totalMembers = memberRepo.count();
        long activeMembers = memberRepo.countByStatus(UserStatus.ACTIVE);
        long inactiveMembers = memberRepo.countByStatus(UserStatus.INACTIVE);
        long recentJoined = memberRepo.countByCreatedAtAfter(LocalDateTime.now().minusWeeks(1));

        // 역할별 분포
        Map<String, Long> roleDistribution = new HashMap<>();
        roleDistribution.put("OT", memberRepo.findAll().stream()
                .filter(m -> m.getRole() == Role.OT).count());
        roleDistribution.put("PT", memberRepo.findAll().stream()
                .filter(m -> m.getRole() == Role.PT).count());
        roleDistribution.put("TRAINER", memberRepo.findAll().stream()
                .filter(m -> m.getRole() == Role.TRAINER).count());
        roleDistribution.put("ADMIN", memberRepo.findAll().stream()
                .filter(m -> m.getRole() == Role.ADMIN).count());

        // 트레이너별 통계
        List<TrainerStatsResponse> trainerStats = getTrainerStats();

        // 월별 가입 추이 (최근 6개월)
        List<MonthlyJoinedResponse> monthlyJoined = new ArrayList<>();
        LocalDate now = LocalDate.now();
        for (int i = 5; i >= 0; i--) {
            LocalDate monthStart = now.minusMonths(i).withDayOfMonth(1);
            LocalDate monthEnd = monthStart.plusMonths(1).minusDays(1);
            LocalDateTime startDateTime = monthStart.atStartOfDay();
            LocalDateTime endDateTime = monthEnd.atTime(23, 59, 59);
            
            long count = memberRepo.findAll().stream()
                    .filter(m -> m.getCreatedAt() != null 
                            && m.getCreatedAt().isAfter(startDateTime) 
                            && m.getCreatedAt().isBefore(endDateTime))
                    .count();
            
            monthlyJoined.add(new MonthlyJoinedResponse(monthStart.getMonthValue(), count));
        }

        // 활동 통계
        long totalWorkoutLogs = workoutLogRepo.count();
        long totalDietLogs = dietLogRepo.count();
        long totalPtSessions = ptSessionRepo.count();

        // 평균 계산
        double avgWorkoutPerMember = totalMembers > 0 ? (double) totalWorkoutLogs / totalMembers : 0;
        double avgDietPerMember = totalMembers > 0 ? (double) totalDietLogs / totalMembers : 0;
        
        long ptMemberCount = memberRepo.findAll().stream()
                .filter(m -> m.getRole() == Role.PT).count();
        double avgPtPerMember = ptMemberCount > 0 ? (double) totalPtSessions / ptMemberCount : 0;

        // PT 전환율
        double ptConversionRate = totalMembers > 0 ? (ptMemberCount * 100.0) / totalMembers : 0;

        // 평균 트레이너당 담당 회원
        long totalTrainers = memberRepo.findAll().stream()
                .filter(m -> m.getRole().isTrainer()).count();
        long membersWithTrainer = memberRepo.findAll().stream()
                .filter(m -> m.getTrainer() != null).count();
        double avgTraineePerTrainer = totalTrainers > 0 ? (double) membersWithTrainer / totalTrainers : 0;

        // 이번 달 신규 회원
        LocalDateTime monthStart = now.withDayOfMonth(1).atStartOfDay();
        long thisMonthJoined = memberRepo.countByCreatedAtAfter(monthStart);

        return AllStatsResponse.builder()
                .totalMembers(totalMembers)
                .activeMembers(activeMembers)
                .inactiveMembers(inactiveMembers)
                .recentJoined(recentJoined)
                .roleDistribution(roleDistribution)
                .trainerStats(trainerStats)
                .monthlyJoined(monthlyJoined)
                .totalWorkoutLogs(totalWorkoutLogs)
                .totalDietLogs(totalDietLogs)
                .totalPtSessions(totalPtSessions)
                .avgWorkoutPerMember(avgWorkoutPerMember)
                .avgDietPerMember(avgDietPerMember)
                .avgPtPerMember(avgPtPerMember)
                .ptConversionRate(ptConversionRate)
                .avgTraineePerTrainer(avgTraineePerTrainer)
                .thisMonthJoined(thisMonthJoined)
                .build();
    }

    // ✅ 회원별 로그 통계
    @Transactional(readOnly = true)
    public List<MemberStatsResponse> getMemberLogStats() {
        return memberRepo.findAll().stream()
                .map(m -> {
                    long workoutCount = workoutLogRepo.countByMemberId(m.getId());
                    long dietCount = dietLogRepo.countByMemberId(m.getId());
                    long totalLogs = workoutCount + dietCount;

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

    // ✅ 트레이너별 담당 회원 통계
    @Transactional(readOnly = true)
    public List<TrainerStatsResponse> getTrainerStats() {
        return memberRepo.findAll().stream()
                .filter(m -> m.getRole().isTrainer())
                .map(trainer -> {
                    long traineeCount = memberRepo.findByTrainerId(trainer.getId()).size();
                    return new TrainerStatsResponse(
                            trainer.getId(),
                            trainer.getName(),
                            traineeCount
                    );
                })
                .toList();
    }

    // ✅ 트레이너 생성
    public MemberResponse createTrainer(Map<String, Object> request) {
        String name = (String) request.get("name");
        String email = (String) request.get("email");
        String phone = (String) request.get("phone");
        String password = (String) request.get("password");

        // 이메일 중복 체크
        if (memberRepo.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        // 전화번호 중복 체크
        if (phone != null && memberRepo.existsByPhone(phone)) {
            throw new IllegalArgumentException("이미 존재하는 전화번호입니다.");
        }

        // 기본 비밀번호 설정 (전화번호 뒷자리 4자리)
        if (password == null || password.isEmpty()) {
            password = phone != null && phone.length() >= 4 
                    ? phone.substring(phone.length() - 4) 
                    : "1234";
        }

        Member trainer = Member.builder()
                .name(name)
                .email(email)
                .phone(phone)
                .password(passwordEncoder.encode(password))
                .role(Role.TRAINER)
                .status(UserStatus.ACTIVE)
                .accountStatus(com.example.demo.common.enums.AccountStatus.ACTIVE)
                .registrationDate(LocalDate.now())
                .build();

        Member savedTrainer = memberRepo.save(trainer);
        return toMemberResponse(savedTrainer);
    }

    // ✅ 트레이너 삭제 (Hard Delete)
public void deleteTrainer(Long trainerId) {
    Member trainer = memberRepo.findById(trainerId)
            .orElseThrow(() -> new EntityNotFoundException("트레이너를 찾을 수 없습니다."));

    if (!trainer.getRole().isTrainer()) {
        throw new IllegalArgumentException("트레이너 계정이 아닙니다.");
    }

    // 담당 회원들의 trainerId를 null로 설정
    List<Member> trainees = memberRepo.findByTrainerId(trainerId);
    trainees.forEach(trainee -> trainee.setTrainer(null));

    // ✨ 하드 삭제 (완전 삭제)
    memberRepo.hardDelete(trainerId);
    memberRepo.flush(); // 즉시 DB에 반영
}

    // ✨ 헬퍼 메서드
    private MemberResponse toMemberResponse(Member m) {
        return new MemberResponse(
                m.getId(),
                m.getName(),
                m.getEmail(),
                m.getPhone(),
                m.getRole(),
                m.getStatus(),
                m.getGender(),
                calculateAge(m.getDateOfBirth()),
                m.getAccountStatus(),
                m.getMembershipType(),
                m.getRegistrationDate(),
                m.getStartDate(),
                m.getCreatedAt(),
                m.getUpdatedAt(),
                m.getTrainer() != null ? m.getTrainer().getId() : null
        );
    }

    private Integer calculateAge(LocalDate birthDate) {
        if (birthDate != null) {
            return Period.between(birthDate, LocalDate.now()).getYears();
        }
        return null;
    }
}