package com.example.demo.admin;

import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.MemberService;
import com.example.demo.workout.WorkoutLogService;
import com.example.demo.admin.dto.MemberStatsResponse;
import com.example.demo.admin.dto.MemberSummaryStatsResponse;
import com.example.demo.diet.DietLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')") // 전체 컨트롤러는 관리자 전용
public class AdminController {

    private final AdminService adminService;
    private final MemberService memberService;
    private final WorkoutLogService workoutLogService;
    private final DietLogService dietLogService;

    // ✅ 모든 회원 조회
    @GetMapping("/members")
    public List<MemberResponse> getAllMembers() {
        return adminService.getAllMembers();
    }

    // ✅ 회원 상태 변경 (예: ACTIVE → INACTIVE)
    @PutMapping("/members/{id}/status")
    public void changeMemberStatus(@PathVariable Long id, @RequestParam String status) {
        adminService.changeMemberStatus(id, status);
    }

    // ✅ 강제 회원 탈퇴
    @DeleteMapping("/members/{id}")
    public void deleteMember(@PathVariable Long id) {
        adminService.deleteMember(id);
    }

    // ✅ 특정 회원 운동 로그 삭제
    @DeleteMapping("/workout-logs/{logId}")
    public void deleteWorkoutLog(@PathVariable Long logId) {
        workoutLogService.delete(logId);
    }

    // ✅ 특정 회원 식단 로그 삭제
    @DeleteMapping("/diet-logs/{logId}")
    public void deleteDietLog(@PathVariable Long logId) {
        dietLogService.delete(logId);
    }

    // ✅ 회원 요약 통계 조회
    @GetMapping("/stats")
    public MemberSummaryStatsResponse getSummaryStats() {
        return adminService.getMemberSummaryStats();
    }

    // ✅ 회원별 로그 통계 조회
    @GetMapping("/member-log-stats")
    public List<MemberStatsResponse> getMemberLogStats() {
        return adminService.getMemberLogStats();
    }

}
