package com.example.demo.stats;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/stats")
public class StatsController {

    private final StatsService statsService;

    // 📊 회원별 통계 조회
    @PreAuthorize("hasAnyRole('OT','PT','TRAINER','ADMIN')")
    @GetMapping("/{memberId}")
    public Map<String, Object> getStats(@PathVariable Long memberId) {
        return statsService.getMemberStats(memberId);
    }
}
