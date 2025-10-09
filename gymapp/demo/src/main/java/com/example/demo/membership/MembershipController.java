package com.example.demo.membership;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.membership.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipService service;

    /**
     * ✨ [핵심 수정] PT 세션 등록 API
     * URL 경로를 프론트엔드 호출과 일치하도록 수정합니다.
     */
    @PostMapping("/register/{memberId}")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public ResponseEntity<MembershipResponse> register(
            @PathVariable Long memberId,
            @Valid @RequestBody MembershipRegisterRequest req,
            @AuthenticationPrincipal UserPrincipal user) {
        MembershipResponse response = service.registerWithPermission(memberId, req, user);
        return ResponseEntity.ok(response);
    }

    // ✅ 멤버십 조회 (본인/트레이너/관리자)
    @GetMapping("/{memberId}")
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    public MembershipResponse get(@PathVariable Long memberId,
                                  @AuthenticationPrincipal UserPrincipal user) {
        return service.getByMemberIdWithPermission(memberId, user);
    }

    // ✅ PT 세션 차감 (트레이너/관리자만)
    @PostMapping("/{memberId}/decrement")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public MembershipResponse decrement(@PathVariable Long memberId,
                                        @RequestBody @Valid MembershipDecrementRequest req,
                                        @AuthenticationPrincipal UserPrincipal user) {
        return service.decrementWithPermission(memberId, req, user);
    }

    // ✅ 잔여 적은 회원 알림 (트레이너/관리자만)
    @GetMapping("/alerts")
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    public List<LowRemainItem> alerts(@RequestParam(defaultValue = "4") int threshold,
                                      @AuthenticationPrincipal UserPrincipal user) {
        return service.lowRemainListWithPermission(threshold, user);
    }

    // ✅ 특정 회원의 가장 최근 멤버십 요약 정보 조회 API
    @GetMapping("/member/{memberId}/latest-summary")
    public ResponseEntity<PreviousMembershipSummaryResponse> getLatestMembershipSummary(@PathVariable Long memberId) {
        PreviousMembershipSummaryResponse summary = service.getLatestMembershipSummary(memberId);
        if (summary == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(summary);
    }

    /**
     * ✨ [추가] 특정 회원의 전체 멤버십 등록 내역 조회 API
     */
    @GetMapping("/member/{memberId}/logs")
    public List<PreviousMembershipSummaryResponse> getMembershipLogs(@PathVariable Long memberId) {
        return service.getMembershipLogs(memberId);
    }
    
}