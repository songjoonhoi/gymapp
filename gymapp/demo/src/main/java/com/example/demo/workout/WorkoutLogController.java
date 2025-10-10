package com.example.demo.workout;

import com.example.demo.workout.dto.WorkoutLogRequest;
import com.example.demo.workout.dto.WorkoutLogResponse;
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
import com.example.demo.auth.UserPrincipal;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import jakarta.persistence.EntityNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workout-logs")
public class WorkoutLogController {

    private final WorkoutLogService service;
    private final WorkoutLogRepository repo;  // ✨ 추가

    // ✅ 생성
    @PostMapping
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    public ResponseEntity<WorkoutLogResponse> create(
            @AuthenticationPrincipal UserPrincipal user,
            @ModelAttribute WorkoutLogRequest req
    ) {
        Long targetMemberId = (req.memberId() != null) ? req.memberId() : user.getId();
        WorkoutLogResponse res = service.create(targetMemberId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }

    // ✨ 단일 운동 조회 (새로 추가!)
    @GetMapping("/detail/{id}")
    public ResponseEntity<WorkoutLogResponse> getById(@PathVariable Long id) {
        WorkoutLog log = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("운동 기록을 찾을 수 없습니다: " + id));
        
        // 권한 체크
        service.checkReadPermission(log.getMember().getId());
        
        // 응답 생성
        String previewUrl = (log.getMediaUrl() != null)
                ? "/api/workout-logs/" + log.getId() + "/media"
                : null;
        
        WorkoutLogResponse response = new WorkoutLogResponse(
                log.getId(),
                log.getMember().getId(),
                log.getTitle(),
                log.getContent(),
                previewUrl,
                log.getMediaType(),
                log.getCreatedAt()
        );
        
        return ResponseEntity.ok(response);
    }

    // ✅ 회원별 조회
    @GetMapping("/member/{memberId}")  // ✨ URL 변경!
    public List<WorkoutLogResponse> listByMember(@PathVariable Long memberId) {
        return service.listByMember(memberId);
    }

    // ✅ 전체 조회
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
        return service.update(logId, new WorkoutLogRequest(title, content, media, null));
    }

    // ✅ 삭제
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @DeleteMapping("/{logId}")
    public void delete(@PathVariable Long logId) {
        service.delete(logId);
    }
}