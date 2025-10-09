package com.example.demo.diet;

import com.example.demo.diet.dto.DietCommentRequest;
import com.example.demo.diet.dto.DietCommentResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diet-logs/{logId}/comments")
public class DietCommentController {

    private final DietCommentService commentService;

    // ✅ 댓글 생성 API
    @PostMapping
    public ResponseEntity<DietCommentResponse> createComment(
            @PathVariable Long logId,
            @Valid @RequestBody DietCommentRequest req
    ) {
        DietCommentResponse newComment = commentService.createComment(logId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(newComment);
    }

    // ✅ 특정 식단일지 댓글 목록 조회 API
    @GetMapping
    public ResponseEntity<List<DietCommentResponse>> getComments(@PathVariable Long logId) {
        List<DietCommentResponse> comments = commentService.getCommentsByLogId(logId);
        return ResponseEntity.ok(comments);
    }

    // ✅ 댓글 삭제 API
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long logId, // URL 구조 유지를 위해 포함
            @PathVariable Long commentId
    ) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }
}