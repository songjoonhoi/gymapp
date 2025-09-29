package com.example.demo.workout;

import com.example.demo.workout.dto.WorkoutLogRequest;
import com.example.demo.workout.dto.WorkoutLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workout-logs")
public class WorkoutLogController {

    private final WorkoutLogService service;

    @PostMapping("/{memberId}")
    public WorkoutLogResponse create(@PathVariable Long memberId,
                                     @RequestParam String title,
                                     @RequestParam String content,
                                     @RequestParam(required = false) MultipartFile media) {
        return service.create(memberId, new WorkoutLogRequest(title, content, media));
    }

    // 수정 (title/content 변경, media 교체 가능)
    @PutMapping("/{logId}")
    public WorkoutLogResponse update(@PathVariable Long logId,
                                     @RequestParam String title,
                                     @RequestParam String content,
                                     @RequestParam(required = false) MultipartFile media) {
        return service.update(logId, new WorkoutLogRequest(title, content, media));
    }

    // 삭제 (엔티티 + 미디어 파일 함께 삭제)
    @DeleteMapping("/{logId}")
    public void delete(@PathVariable Long logId) {
        service.delete(logId);
    }

    // 회원별 목록
    @GetMapping("/{memberId}")
    public List<WorkoutLogResponse> listByMember(@PathVariable Long memberId) {
        return service.listByMember(memberId);
    }

    // 전체 목록 페이지네이션
    @GetMapping
    public Page<WorkoutLogResponse> list(@RequestParam(defaultValue = "0") int page,
                                         @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return service.findAll(pageable);
    }
}
