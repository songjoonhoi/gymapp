package com.example.demo.ptsession;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.membership.Membership;
import com.example.demo.membership.MembershipRepository;
import com.example.demo.membership.SessionType;
import com.example.demo.notification.NotificationService;
import com.example.demo.notification.NotificationType;
import com.example.demo.ptsession.dto.PtSessionRequest;
import com.example.demo.ptsession.dto.PtSessionResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PtSessionService {

    private final PtSessionRepository sessionRepo;
    private final MemberRepository memberRepo;
    private final MembershipRepository membershipRepo;
    private final NotificationService notiService;

    /**
     * PT 세션 기록 생성
     * - 트레이너만 생성 가능
     * - PT 횟수 자동 차감
     */
    public PtSessionResponse create(PtSessionRequest req) {
        UserPrincipal currentUser = getCurrentUser();

        // 트레이너 확인
        Member trainer = memberRepo.findById(currentUser.getId())
                .orElseThrow(() -> new EntityNotFoundException("트레이너를 찾을 수 없습니다."));

        if (!currentUser.isTrainer() && !currentUser.isAdmin()) {
            throw new AccessDeniedException("트레이너만 PT 세션을 기록할 수 있습니다.");
        }

        // 회원 확인
        Member member = memberRepo.findById(req.memberId())
                .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다: " + req.memberId()));

        // 담당 트레이너 확인 (관리자는 제외)
        if (!currentUser.isAdmin()) {
            if (member.getTrainer() == null || !member.getTrainer().getId().equals(currentUser.getId())) {
                throw new AccessDeniedException("담당 회원이 아닙니다.");
            }
        }

        // PT 세션 생성
        PtSession session = PtSession.builder()
                .member(member)
                .trainer(trainer)
                .sessionDate(req.sessionDate())
                .duration(req.duration())
                .content(req.content())
                .memo(req.memo())
                .isCompleted(true)
                .build();

        sessionRepo.save(session);

        // PT 횟수 차감
        Membership membership = membershipRepo.findByMemberId(req.memberId())
                .orElseThrow(() -> new EntityNotFoundException("회원권 정보가 없습니다."));

        membership.decrement(SessionType.REGULAR);

        // 알림 생성
        notiService.create(
                req.memberId(),
                NotificationType.SUCCESS,
                String.format("PT 세션이 완료되었습니다. (트레이너: %s)", trainer.getName())
        );

        // 잔여 PT 3회 이하 경고
        if (membership.remainPT() <= 3 && membership.remainPT() > 0) {
            notiService.create(
                    req.memberId(),
                    NotificationType.WARNING,
                    String.format("⚠️ PT 잔여 횟수가 %d회 남았습니다!", membership.remainPT())
            );
        }

        return PtSessionResponse.fromEntity(session);
    }

    /**
     * 회원별 PT 세션 조회
     * - 본인, 담당 트레이너, 관리자만 조회 가능
     */
    @Transactional(readOnly = true)
    public List<PtSessionResponse> getByMemberId(Long memberId) {
        checkReadPermission(memberId);

        return sessionRepo.findByMemberIdOrderBySessionDateDesc(memberId).stream()
                .map(PtSessionResponse::fromEntity)
                .toList();
    }

    /**
     * 트레이너별 PT 세션 조회
     * - 본인, 관리자만 조회 가능
     */
    @Transactional(readOnly = true)
    public List<PtSessionResponse> getByTrainerId(Long trainerId) {
        UserPrincipal currentUser = getCurrentUser();

        if (!currentUser.isAdmin() && !currentUser.getId().equals(trainerId)) {
            throw new AccessDeniedException("자신의 PT 세션만 조회할 수 있습니다.");
        }

        return sessionRepo.findByTrainerIdOrderBySessionDateDesc(trainerId).stream()
                .map(PtSessionResponse::fromEntity)
                .toList();
    }

    /**
     * 특정 기간 PT 세션 조회
     */
    @Transactional(readOnly = true)
    public List<PtSessionResponse> getByMemberIdAndDateRange(
            Long memberId,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        checkReadPermission(memberId);

        return sessionRepo.findByMemberIdAndDateRange(memberId, startDate, endDate).stream()
                .map(PtSessionResponse::fromEntity)
                .toList();
    }

    /**
     * PT 세션 수정
     * - 작성한 트레이너, 관리자만 수정 가능
     */
    public PtSessionResponse update(Long sessionId, PtSessionRequest req) {
        PtSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("PT 세션을 찾을 수 없습니다: " + sessionId));

        checkWritePermission(session.getTrainer().getId());

        session.setSessionDate(req.sessionDate());
        session.setDuration(req.duration());
        session.setContent(req.content());
        session.setMemo(req.memo());

        return PtSessionResponse.fromEntity(session);
    }

    /**
     * PT 세션 삭제
     * - 작성한 트레이너, 관리자만 삭제 가능
     * - 삭제 시 PT 횟수 복구
     */
    public void delete(Long sessionId) {
        PtSession session = sessionRepo.findById(sessionId)
                .orElseThrow(() -> new EntityNotFoundException("PT 세션을 찾을 수 없습니다: " + sessionId));

        checkWritePermission(session.getTrainer().getId());

        // PT 횟수 복구
        Membership membership = membershipRepo.findByMemberId(session.getMember().getId())
                .orElseThrow(() -> new EntityNotFoundException("회원권 정보가 없습니다."));

        membership.setPtUsed(membership.getPtUsed() - 1);

        sessionRepo.delete(session);

        notiService.create(
                session.getMember().getId(),
                NotificationType.INFO,
                "PT 세션 기록이 삭제되었습니다. PT 횟수가 복구되었습니다."
        );
    }

    // ========================
    // 🔒 권한 체크 헬퍼
    // ========================

    private void checkReadPermission(Long memberId) {
        UserPrincipal user = getCurrentUser();

        // 관리자는 모든 PT 세션 조회 가능
        if (user.isAdmin()) return;

        // 본인은 자기 PT 세션 조회 가능
        if (user.getId().equals(memberId)) return;

        // 트레이너는 담당 회원의 PT 세션 조회 가능
        if (user.isTrainer()) {
            Member member = memberRepo.findById(memberId)
                    .orElseThrow(() -> new EntityNotFoundException("회원을 찾을 수 없습니다."));
            if (member.getTrainer() != null && member.getTrainer().getId().equals(user.getId())) {
                return;
            }
        }

        throw new AccessDeniedException("해당 회원의 PT 세션을 조회할 권한이 없습니다.");
    }

    private void checkWritePermission(Long trainerId) {
        UserPrincipal user = getCurrentUser();

        // 관리자는 모든 PT 세션 수정/삭제 가능
        if (user.isAdmin()) return;

        // 작성한 트레이너 본인만 수정/삭제 가능
        if (user.getId().equals(trainerId)) return;

        throw new AccessDeniedException("PT 세션을 수정/삭제할 권한이 없습니다.");
    }

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }
        return user;
    }
}