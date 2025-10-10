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
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diet-logs")
public class DietLogController {

    private final DietLogService service;
    private final DietLogRepository repo;  // ✨ 추가

    // ✅ 생성
    @PostMapping
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    public ResponseEntity<DietLogResponse> create(
            @AuthenticationPrincipal UserPrincipal user,
            @ModelAttribute DietLogRequest req
    ) {
        Long targetMemberId = (req.memberId() != null) ? req.memberId() : user.getId();
        DietLogResponse res = service.create(targetMemberId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    // ✨ 단일 식단 조회 (새로 추가!)
    @GetMapping("/detail/{id}")
    public ResponseEntity<DietLogResponse> getById(@PathVariable Long id) {
        DietLog log = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("식단 기록을 찾을 수 없습니다: " + id));
        
        // 권한 체크
        service.checkReadPermission(log.getMember().getId());
        
        // 응답 생성
        DietLogResponse response = new DietLogResponse(
                log.getId(),
                log.getMember().getId(),
                log.getTitle(),
                log.getContent(),
                log.getMediaUrl(),
                log.getMediaType(),
                log.getCalories(),
                null,
                null,
                log.getCreatedAt()
        );
        
        return ResponseEntity.ok(response);
    }

    // ✅ 회원별 조회
    @GetMapping("/member/{memberId}")  // ✨ URL 변경!
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

    // ✅ 검색/필터링
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

    // ✅ 수정
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @PutMapping("/{logId}")
    public DietLogResponse update(@PathVariable Long logId,
                                  @RequestParam String title,
                                  @RequestParam String content,
                                  @RequestParam(required = false) MultipartFile media) {
        return service.update(logId, new DietLogRequest(title, content, media, null));
    }

    // ✅ 삭제
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @DeleteMapping("/{logId}")
    public void delete(@PathVariable Long logId) {
        service.delete(logId);
    }

    // ✅ 칼로리 통계
    @GetMapping("/member/{memberId}/calories/total")  // ✨ URL 변경!
    public int getTotalCalories(@PathVariable Long memberId) {
        return service.getTotalCalories(memberId);
    }

    @GetMapping("/member/{memberId}/calories/period")  // ✨ URL 변경!
    public int getCaloriesForPeriod(
            @PathVariable Long memberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end
    ) {
        return service.getCaloriesForPeriod(memberId, start, end);
    }

    @GetMapping("/member/{memberId}/calories/today")  // ✨ URL 변경!
    public int getCaloriesToday(@PathVariable Long memberId) {
        return service.getCaloriesToday(memberId);
    }

    @GetMapping("/member/{memberId}/calories/week")  // ✨ URL 변경!
    public int getCaloriesThisWeek(@PathVariable Long memberId) {
        return service.getCaloriesThisWeek(memberId);
    }

    @GetMapping("/member/{memberId}/calories/month")  // ✨ URL 변경!
    public int getCaloriesThisMonth(@PathVariable Long memberId) {
        return service.getCaloriesThisMonth(memberId);
    }
}