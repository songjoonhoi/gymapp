package com.example.demo.diet;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diet-logs")
public class DietMediaController {

    private final DietLogRepository repo;

    @GetMapping("/{logId}/media")
    public ResponseEntity<Void> preview(@PathVariable Long logId) {
        var log = repo.findById(logId).orElseThrow();

        if (log.getMediaUrl() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.status(302)
                .header("Location", log.getMediaUrl())
                .build();
    }
}
