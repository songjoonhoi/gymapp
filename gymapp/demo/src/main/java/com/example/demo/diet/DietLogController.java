package com.example.demo.diet;

import com.example.demo.diet.dto.DietLogRequest;
import com.example.demo.diet.dto.DietLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diet-logs")
public class DietLogController {

    private final DietLogService service;

    // ✅ 생성
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @PostMapping("/{memberId}")
    public DietLogResponse create(@PathVariable Long memberId,
                                  @RequestParam String title,
                                  @RequestParam String content,
                                  @RequestParam(required = false) MultipartFile media) {
        return service.create(memberId, new DietLogRequest(title, content, media));
    }

    // ✅ 회원별 조회
    @GetMapping("/{memberId}")
    public List<DietLogResponse> listByMember(@PathVariable Long memberId) {
        return service.listByMember(memberId);
    }

    // ✅ 전체 조회 (페이지네이션)
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
        return service.update(logId, new DietLogRequest(title, content, media));
    }

    // ✅ 삭제
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @DeleteMapping("/{logId}")
    public void delete(@PathVariable Long logId) {
        service.delete(logId);
    }

    // ✅ 본인 칼로리 합계
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

    // ==========================
    // ✅ 트레이너 전용 API
    // ==========================

    // 트레이너가 특정 회원 로그 조회
    @GetMapping("/trainer/{memberId}")
    @PreAuthorize("hasRole('TRAINER') or hasRole('ADMIN')")
    public List<DietLogResponse> getMemberDietLogs(@PathVariable Long memberId) {
        return service.listByMember(memberId);
    }

    // 트레이너가 특정 회원 칼로리 합계 조회 (오늘/주간/월간)
    @GetMapping("/trainer/{memberId}/calories/{range}")
    @PreAuthorize("hasRole('TRAINER') or hasRole('ADMIN')")
    public int getMemberCalories(
            @PathVariable Long memberId,
            @PathVariable String range
    ) {
        return switch (range) {
            case "today" -> service.getCaloriesToday(memberId);
            case "week" -> service.getCaloriesThisWeek(memberId);
            case "month" -> service.getCaloriesThisMonth(memberId);
            default -> throw new IllegalArgumentException("잘못된 range 값입니다. (today/week/month)");
        };
    }
}
