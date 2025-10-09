package com.example.demo.diet;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.diet.dto.DietCommentRequest;
import com.example.demo.diet.dto.DietCommentResponse;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DietCommentService {

    private final DietCommentRepository commentRepo;
    private final DietLogRepository logRepo;
    private final MemberRepository memberRepo;
    private final DietLogService dietLogService; // 권한 체크 헬퍼 재사용

    /**
     * 댓글 생성
     * 권한: 식단일지 작성/수정 권한이 있는 사용자 (PT회원 본인, 담당 트레이너, 관리자)
     */
    public DietCommentResponse createComment(Long logId, DietCommentRequest req) {
        UserPrincipal currentUser = getCurrentUser();
        DietLog dietLog = logRepo.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("식단일지를 찾을 수 없습니다: " + logId));

        // 식단일지 쓰기 권한 체크
        dietLogService.checkWritePermission(dietLog.getMember().getId());

        Member author = memberRepo.findById(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다: " + currentUser.getId()));

        DietComment comment = DietComment.builder()
                .content(req.content())
                .dietLog(dietLog)
                .member(author)
                .build();

        commentRepo.save(comment);
        return DietCommentResponse.fromEntity(comment);
    }

    /**
     * 특정 식단일지의 댓글 목록 조회
     * 권한: 식단일지 조회 권한이 있는 모든 사용자
     */
    @Transactional(readOnly = true)
    public List<DietCommentResponse> getCommentsByLogId(Long logId) {
        DietLog dietLog = logRepo.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("식단일지를 찾을 수 없습니다: " + logId));

        // 식단일지 읽기 권한 체크
        dietLogService.checkReadPermission(dietLog.getMember().getId());

        return commentRepo.findByDietLogIdOrderByCreatedAtAsc(logId).stream()
                .map(DietCommentResponse::fromEntity)
                .toList();
    }

    /**
     * 댓글 삭제
     * 권한: 댓글 작성자 본인, 담당 트레이너, 관리자
     */
    public void deleteComment(Long commentId) {
        UserPrincipal currentUser = getCurrentUser();
        DietComment comment = commentRepo.findById(commentId)
                .orElseThrow(() -> new EntityNotFoundException("댓글을 찾을 수 없습니다: " + commentId));

        Member logOwner = comment.getDietLog().getMember();

        // 1. 관리자인 경우
        if (currentUser.isAdmin()) {
            commentRepo.delete(comment);
            return;
        }

        // 2. 댓글 작성자 본인인 경우
        if (comment.getMember().getId().equals(currentUser.getId())) {
            commentRepo.delete(comment);
            return;
        }

        // 3. 식단일지 주인의 담당 트레이너인 경우
        if (currentUser.isTrainer()) {
            if (logOwner.getTrainer() != null && logOwner.getTrainer().getId().equals(currentUser.getId())) {
                commentRepo.delete(comment);
                return;
            }
        }
        
        throw new AccessDeniedException("댓글을 삭제할 권한이 없습니다.");
    }

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }
        return user;
    }
}