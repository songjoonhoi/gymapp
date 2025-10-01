package com.example.demo.member;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.Role;
import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import com.example.demo.member.dto.PasswordChangeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService service;

    @PostMapping
    public MemberResponse create(@RequestBody @Valid MemberCreateRequest req) {
        return service.create(req);
    }

    @GetMapping("/{id}")
    public MemberResponse get(@PathVariable Long id,
                              @AuthenticationPrincipal UserPrincipal user) {
        if (user.getRoleEnum() == Role.ADMIN || user.getId().equals(id)) {
            return service.get(id);
        }
        if (user.getRoleEnum() == Role.TRAINER) {
            MemberResponse mr = service.get(id);
            if (mr.trainerId() != null && mr.trainerId().equals(user.getId())) {
                return mr;
            }
        }
        throw new AccessDeniedException("접근 권한이 없습니다.");
    }

    @GetMapping
    public Page<MemberResponse> list(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size,
                                     @AuthenticationPrincipal UserPrincipal user) {
        if (user.getRoleEnum() != Role.ADMIN) {
            throw new AccessDeniedException("관리자만 전체 목록을 조회할 수 있습니다.");
        }
        return service.list(PageRequest.of(page, size));
    }

    @PutMapping("/{id}")
    public MemberResponse update(@PathVariable Long id,
                                 @RequestBody MemberUpdateRequest req,
                                 @AuthenticationPrincipal UserPrincipal user) {
        if (user.getRoleEnum() == Role.ADMIN || user.getId().equals(id)) {
            return service.update(id, req);
        }
        throw new AccessDeniedException("본인만 수정할 수 있습니다.");
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserPrincipal user) {
        if (user.getRoleEnum() == Role.ADMIN || user.getId().equals(id)) {
            service.delete(id);
            return;
        }
        throw new AccessDeniedException("본인만 삭제할 수 있습니다.");
    }

    @GetMapping("/me")
    public MemberResponse me(@AuthenticationPrincipal UserPrincipal user) {
        return service.get(user.getId());
    }

    @PutMapping("/me")
    public MemberResponse updateMe(@AuthenticationPrincipal UserPrincipal user,
                                   @RequestBody MemberUpdateRequest req) {
        return service.update(user.getId(), req);
    }

    @DeleteMapping("/me")
    public void deleteMe(@AuthenticationPrincipal UserPrincipal user) {
        service.delete(user.getId());
    }

    @PutMapping("/{id}/password")
    public void changePassword(@PathVariable Long id,
                               @RequestBody @Valid PasswordChangeRequest req,
                               @AuthenticationPrincipal UserPrincipal user) {
        if (user.getRoleEnum() == Role.ADMIN || user.getId().equals(id)) {
            service.changePassword(id, req);
            return;
        }
        throw new AccessDeniedException("본인만 비밀번호를 변경할 수 있습니다.");
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{memberId}/assign-trainer/{trainerId}")
    public void assignTrainer(@PathVariable Long memberId,
                              @PathVariable Long trainerId) {
        service.assignTrainer(memberId, trainerId);
    }

    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    @GetMapping("/{trainerId}/trainees")
    public List<MemberResponse> trainees(@PathVariable Long trainerId,
                                         @AuthenticationPrincipal UserPrincipal user) {
        if (user.getRoleEnum() == Role.ADMIN || user.getId().equals(trainerId)) {
            return service.getTrainees(trainerId);
        }
        throw new AccessDeniedException("자신의 회원만 조회할 수 있습니다.");
    }
}
