package com.example.demo.member;

import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import com.example.demo.member.dto.PasswordChangeRequest;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;
import com.example.demo.auth.UserPrincipal;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

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
    public MemberResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public Page<MemberResponse> list(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size) {
        return service.list(PageRequest.of(page, size));
    }

    @PutMapping("/{id}")
    public MemberResponse update(@PathVariable Long id,
                                 @RequestBody MemberUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id); // 소프트 삭제
    }

    // ✅ 내 정보 조회
    @GetMapping("/me")
    public MemberResponse me(@AuthenticationPrincipal UserPrincipal user) {
        return service.get(user.getId());
    }

    // ✅ 내 정보 수정
    @PutMapping("/me")
    public MemberResponse updateMe(@AuthenticationPrincipal UserPrincipal user,
                                   @RequestBody MemberUpdateRequest req) {
        return service.update(user.getId(), req);
    }

    // ✅ 내 계정 삭제 (소프트 삭제)
    @DeleteMapping("/me")
    public void deleteMe(@AuthenticationPrincipal UserPrincipal user) {
        service.delete(user.getId());
    }

    // ✅ 비밀번호 변경
    @PutMapping("/{id}/password")
    public void changePassword(@PathVariable Long id,
                               @RequestBody @Valid PasswordChangeRequest req) {
        service.changePassword(id, req);
    }

}
