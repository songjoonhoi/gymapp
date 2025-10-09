package com.example.demo.diet;

import com.example.demo.diet.dto.DietLogRequest;
import com.example.demo.diet.dto.DietLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.example.demo.auth.UserPrincipal;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diet-logs")
public class DietLogController {

    private final DietLogService service;

    // ✅ 생성 (회원/트레이너/관리자)
    @PostMapping // ✨ [수정] URL에서 "/{memberId}" 제거
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    public ResponseEntity<DietLogResponse> create(
            @AuthenticationPrincipal UserPrincipal user,
            @ModelAttribute DietLogRequest req
    ) {
        // ✨ [핵심 수정] 트레이너가 보낸 memberId가 있으면 그것을 사용하고,
        // 없으면(회원 본인이 작성) 로그인한 사용자 ID를 사용합니다.
        Long targetMemberId = (req.memberId() != null) ? req.memberId() : user.getId();

        DietLogResponse res = service.create(targetMemberId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    // ✅ 회원별 조회 (권한 체크는 Service에서)
    @GetMapping("/{memberId}")
    public List<DietLogResponse> listByMember(@PathVariable Long memberId) {
        return service.listByMember(memberId);
    }

    // ✅ 전체 조회 (관리자만)
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public Page<DietLogResponse> list(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return service.findAll(pageable);
    }

    // ✅ 검색/필터링 (Service 권한체크 적용)
    @GetMapping("/search")
    public Page<DietLogResponse> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Long memberId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime toDate,
            @RequestParam(required = false) String mediaType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return service.search(keyword, memberId, fromDate, toDate, mediaType, pageable);
    }

    // ✅ 수정 (본인 / 트레이너 / 관리자)
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @PutMapping("/{logId}")
    public DietLogResponse update(@PathVariable Long logId,
                                  @RequestParam String title,
                                  @RequestParam String content,
                                  @RequestParam(required = false) MultipartFile media) {
        return service.update(logId, new DietLogRequest(title, content, media,null));
    }

    // ✅ 삭제 (본인 / 트레이너 / 관리자)
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @DeleteMapping("/{logId}")
    public void delete(@PathVariable Long logId) {
        service.delete(logId);
    }

    // ✅ 본인/트레이너/관리자 → 칼로리 통계 조회
    @GetMapping("/{memberId}/calories/total")
    public int getTotalCalories(@PathVariable Long memberId) {
        return service.getTotalCalories(memberId);
    }

    @GetMapping("/{memberId}/calories/period")
    public int getCaloriesForPeriod(
            @PathVariable Long memberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return service.getCaloriesForPeriod(memberId, start, end);
    }

    @GetMapping("/{memberId}/calories/today")
    public int getCaloriesToday(@PathVariable Long memberId) {
        return service.getCaloriesToday(memberId);
    }

    @GetMapping("/{memberId}/calories/week")
    public int getCaloriesThisWeek(@PathVariable Long memberId) {
        return service.getCaloriesThisWeek(memberId);
    }

    @GetMapping("/{memberId}/calories/month")
    public int getCaloriesThisMonth(@PathVariable Long memberId) {
        return service.getCaloriesThisMonth(memberId);
    }
}
