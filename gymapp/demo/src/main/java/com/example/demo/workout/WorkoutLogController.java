package com.example.demo.workout;

import com.example.demo.workout.dto.WorkoutLogRequest;
import com.example.demo.workout.dto.WorkoutLogResponse;
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
@RequestMapping("/api/workout-logs")
public class WorkoutLogController {

    private final WorkoutLogService service;

    // ✅ 생성
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @PostMapping("/{memberId}")
    public WorkoutLogResponse create(@PathVariable Long memberId,
                                     @RequestParam String title,
                                     @RequestParam String content,
                                     @RequestParam(required = false) MultipartFile media) {
        return service.create(memberId, new WorkoutLogRequest(title, content, media));
    }

    // ✅ 회원별 조회
    @GetMapping("/{memberId}")
    public List<WorkoutLogResponse> listByMember(@PathVariable Long memberId) {
        return service.listByMember(memberId);
    }

    // ✅ 전체 조회 (페이지네이션)
    @GetMapping
    public Page<WorkoutLogResponse> list(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return service.findAll(pageable);
    }

    // ✅ 검색/필터링
    @GetMapping("/search")
    public Page<WorkoutLogResponse> search(
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
    public WorkoutLogResponse update(@PathVariable Long logId,
                                     @RequestParam String title,
                                     @RequestParam String content,
                                     @RequestParam(required = false) MultipartFile media) {
        return service.update(logId, new WorkoutLogRequest(title, content, media));
    }

    // ✅ 삭제
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @DeleteMapping("/{logId}")
    public void delete(@PathVariable Long logId) {
        service.delete(logId);
    }
}
