package com.example.demo.admin;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.Role;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.admin.dto.MemberStatsResponse;
import com.example.demo.admin.dto.MemberSummaryStatsResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    // ✨ 다른 서비스에 대한 직접 의존성을 모두 제거했습니다.

    @GetMapping("/members")
    public List<MemberResponse> getAllMembers() {
        return adminService.getAllMembers();
    }

    @PutMapping("/members/{id}/status")
    public ResponseEntity<Void> changeMemberStatus(@PathVariable("id") Long memberId, @RequestBody Map<String, String> payload) {
        adminService.changeMemberStatus(memberId, payload.get("status"));
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/members/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable("id") Long memberId) {
        adminService.deleteMember(memberId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats/summary") // ✨ URL 수정 (stats -> stats/summary)
    public MemberSummaryStatsResponse getSummaryStats() {
        return adminService.getMemberSummaryStats();
    }

    @GetMapping("/member-log-stats")
    public List<MemberStatsResponse> getMemberLogStats() {
        return adminService.getMemberLogStats();
    }

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
}