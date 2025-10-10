package com.example.demo.ptsession;

import com.example.demo.ptsession.dto.PtSessionRequest;
import com.example.demo.ptsession.dto.PtSessionResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/pt-sessions")
public class PtSessionController {

    private final PtSessionService sessionService;

    /**
     * PT 세션 기록 생성
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<PtSessionResponse> create(@Valid @RequestBody PtSessionRequest req) {
        PtSessionResponse response = sessionService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 회원별 PT 세션 조회
     */
    @GetMapping("/member/{memberId}")
    public List<PtSessionResponse> getByMember(@PathVariable Long memberId) {
        return sessionService.getByMemberId(memberId);
    }

    /**
     * 트레이너별 PT 세션 조회
     */
    @GetMapping("/trainer/{trainerId}")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public List<PtSessionResponse> getByTrainer(@PathVariable Long trainerId) {
        return sessionService.getByTrainerId(trainerId);
    }

    /**
     * 특정 기간 PT 세션 조회
     */
    @GetMapping("/member/{memberId}/period")
    public List<PtSessionResponse> getByMemberAndDateRange(
            @PathVariable Long memberId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return sessionService.getByMemberIdAndDateRange(memberId, startDate, endDate);
    }

    /**
     * PT 세션 수정
     */
    @PutMapping("/{sessionId}")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public PtSessionResponse update(
            @PathVariable Long sessionId,
            @Valid @RequestBody PtSessionRequest req
    ) {
        return sessionService.update(sessionId, req);
    }

    /**
     * PT 세션 삭제
     */
    @DeleteMapping("/{sessionId}")
    @PreAuthorize("hasAnyRole('TRAINER', 'ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long sessionId) {
        sessionService.delete(sessionId);
        return ResponseEntity.noContent().build();
    }
}