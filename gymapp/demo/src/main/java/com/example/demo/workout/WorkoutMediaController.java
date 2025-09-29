package com.example.demo.workout;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/workout-logs")
public class WorkoutMediaController {

    private final WorkoutLogRepository repo;

    @GetMapping("/{logId}/media")
    public ResponseEntity<Void> preview(@PathVariable Long logId) {
        var log = repo.findById(logId).orElseThrow();
        if (log.getMediaUrl() == null) {
            return ResponseEntity.notFound().build();
        }
        // 간단하게 302 리다이렉트 → 정적 파일 URL
        return ResponseEntity.status(302)
                .header("Location", log.getMediaUrl())
                .build();
    }
}
