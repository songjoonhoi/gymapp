package com.example.demo.membership;

import com.example.demo.membership.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipService service;

    @GetMapping("/{memberId}")
    public MembershipResponse get(@PathVariable Long memberId) {
        return service.getByMemberId(memberId);
    }

    @PostMapping("/{memberId}/register")
    public MembershipResponse register(@PathVariable Long memberId,
                                       @RequestBody @Valid MembershipRegisterRequest req) {
        return service.register(memberId, req);
    }

    @PostMapping("/{memberId}/decrement")
    public MembershipResponse decrement(@PathVariable Long memberId,
                                        @RequestBody @Valid MembershipDecrementRequest req) {
        return service.decrement(memberId, req);
    }

    @GetMapping("/alerts")
    public List<LowRemainItem> alerts(@RequestParam(defaultValue = "4") int threshold) {
        return service.lowRemainList(threshold);
    }
}
