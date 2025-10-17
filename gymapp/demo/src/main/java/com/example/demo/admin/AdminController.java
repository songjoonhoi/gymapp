package com.example.demo.admin;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberCreateRequest; // ✨ 추가
import com.example.demo.admin.dto.MemberStatsResponse;
import com.example.demo.admin.dto.MemberSummaryStatsResponse;
import com.example.demo.admin.dto.TrainerStatsResponse;
import com.example.demo.admin.dto.AllStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid; // ✨ 추가

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ✅ 전체 회원 조회
    @GetMapping("/members")
    public List<MemberResponse> getAllMembers() {
        return adminService.getAllMembers();
    }

    // ✨ 회원 생성 API 추가
    @PostMapping("/members")
    public ResponseEntity<MemberResponse> createMember(@Valid @RequestBody MemberCreateRequest req) {
        MemberResponse created = adminService.createMember(req);
        return ResponseEntity.ok(created);
    }

    // ✅ 회원 상태 변경
    @PutMapping("/members/{id}/status")
    public ResponseEntity<Void> changeMemberStatus(
            @PathVariable("id") Long memberId, 
            @RequestBody Map<String, String> payload) {
        adminService.changeMemberStatus(memberId, payload.get("status"));
        return ResponseEntity.ok().build();
    }

    // ✅ 회원 등급 변경
    @PutMapping("/members/{id}/role")
    @PreAuthorize("hasAnyRole('ADMIN', 'TRAINER')")
    public ResponseEntity<Void> updateMemberRole(
            @PathVariable("id") Long memberId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        Role newRole = Role.valueOf(payload.get("role").toUpperCase());
        adminService.updateMemberRole(memberId, newRole, currentUser);
        return ResponseEntity.ok().build();
    }

    // ✅ 회원 삭제
    @DeleteMapping("/members/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable("id") Long memberId) {
        adminService.deleteMember(memberId);
        return ResponseEntity.noContent().build();
    }

    // ✅ 요약 통계
    @GetMapping("/stats/summary")
    public MemberSummaryStatsResponse getSummaryStats() {
        return adminService.getMemberSummaryStats();
    }

    // ✅ 전체 통계
    @GetMapping("/stats/all")
    public AllStatsResponse getAllStats() {
        return adminService.getAllStats();
    }

    // ✅ 회원별 로그 통계
    @GetMapping("/member-log-stats")
    public List<MemberStatsResponse> getMemberLogStats() {
        return adminService.getMemberLogStats();
    }

    // ✅ 트레이너 목록 조회
    @GetMapping("/trainers")
    public List<MemberResponse> getAllTrainers() {
        return adminService.getAllTrainers();
    }

    // ✅ 트레이너별 담당 회원 통계
    @GetMapping("/trainer-stats")
    public List<TrainerStatsResponse> getTrainerStats() {
        return adminService.getTrainerStats();
    }

    // ✅ 트레이너 생성
    @PostMapping("/trainers")
    public ResponseEntity<MemberResponse> createTrainer(@RequestBody Map<String, Object> request) {
        MemberResponse trainer = adminService.createTrainer(request);
        return ResponseEntity.ok(trainer);
    }

    // ✅ 트레이너 삭제
    @DeleteMapping("/trainers/{trainerId}")
    public ResponseEntity<Void> deleteTrainer(@PathVariable Long trainerId) {
        adminService.deleteTrainer(trainerId);
        return ResponseEntity.noContent().build();
    }
}