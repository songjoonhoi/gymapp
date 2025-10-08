package com.example.demo.member;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import com.example.demo.member.dto.PasswordChangeRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {

    private final MemberService service;

    // ✅ 회원 생성 (회원가입)
    @PostMapping
    public MemberResponse create(@RequestBody @Valid MemberCreateRequest req) {
        return service.create(req);
    }

    // ✅ 회원 단건 조회 (권한 체크는 Service에서)
    @GetMapping("/{id}")
    public MemberResponse get(@PathVariable Long id,
                              @AuthenticationPrincipal UserPrincipal user) {
        return service.getWithPermission(id, user);
    }

    // ✅ 전체 회원 조회 (관리자만)
    @GetMapping
    public Page<MemberResponse> list(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size,
                                     @AuthenticationPrincipal UserPrincipal user) {
        return service.listWithPermission(PageRequest.of(page, size), user);
    }

    // ✅ 회원 정보 수정
    @PutMapping("/{id}")
    public MemberResponse update(@PathVariable Long id,
                                 @RequestBody MemberUpdateRequest req,
                                 @AuthenticationPrincipal UserPrincipal user) {
        return service.updateWithPermission(id, req, user);
    }

    // ✅ 회원 삭제
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id,
                       @AuthenticationPrincipal UserPrincipal user) {
        service.deleteWithPermission(id, user);
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

    // ✅ 내 계정 삭제
    @DeleteMapping("/me")
    public void deleteMe(@AuthenticationPrincipal UserPrincipal user) {
        service.delete(user.getId());
    }

    // ✅ 비밀번호 변경
    @PutMapping("/{id}/password")
    public void changePassword(@PathVariable Long id,
                               @RequestBody @Valid PasswordChangeRequest req,
                               @AuthenticationPrincipal UserPrincipal user) {
        service.changePasswordWithPermission(id, req, user);
    }

    // ✅ (관리자) 트레이너 배정/변경
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{memberId}/assign-trainer/{trainerId}")
    public void assignTrainer(@PathVariable Long memberId,
                              @PathVariable Long trainerId) {
        service.assignTrainer(memberId, trainerId);
    }

    // ✅ (트레이너/관리자) 트레이너 담당 회원 목록
    @PreAuthorize("hasAnyRole('TRAINER','ADMIN')")
    @GetMapping("/{trainerId}/trainees")
    public List<MemberResponse> trainees(@PathVariable Long trainerId,
                                         @AuthenticationPrincipal UserPrincipal user) {
        return service.getTraineesWithPermission(trainerId, user);
    }

    // ✅ (새로 추가) CSV 파일로 회원 일괄 등록
    @PostMapping("/upload-csv")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public void uploadCsv(@RequestParam("file") MultipartFile file,
                          @AuthenticationPrincipal UserPrincipal user) {
        try {
            service.createMembersFromCsv(file, user);
        } catch (Exception e) {
            // 예외 처리 (실제 프로덕션에서는 더 정교한 예외 처리가 필요)
            throw new RuntimeException("CSV 파일 업로드 및 처리 중 오류 발생: " + e.getMessage());
        }
    }

    
}

