package com.example.demo.membership;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.membership.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipService service;

    // ✅ 멤버십 조회 (본인/트레이너/관리자)
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @GetMapping("/{memberId}")
    public MembershipResponse get(@PathVariable Long memberId,
                                  @AuthenticationPrincipal UserPrincipal user) {
        return service.getByMemberIdWithPermission(memberId, user);
    }

    // ✅ PT 세션 등록 (트레이너/관리자만)
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    @PostMapping("/{memberId}/register")
    public MembershipResponse register(@PathVariable Long memberId,
                                       @RequestBody @Valid MembershipRegisterRequest req,
                                       @AuthenticationPrincipal UserPrincipal user) {
        return service.registerWithPermission(memberId, req, user);
    }

    // ✅ PT 세션 차감 (트레이너/관리자만)
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    @PostMapping("/{memberId}/decrement")
    public MembershipResponse decrement(@PathVariable Long memberId,
                                        @RequestBody @Valid MembershipDecrementRequest req,
                                        @AuthenticationPrincipal UserPrincipal user) {
        return service.decrementWithPermission(memberId, req, user);
    }

    // ✅ 잔여 적은 회원 알림 (트레이너/관리자만)
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    @GetMapping("/alerts")
    public List<LowRemainItem> alerts(@RequestParam(defaultValue = "4") int threshold,
                                      @AuthenticationPrincipal UserPrincipal user) {
        return service.lowRemainListWithPermission(threshold, user);
    }
}