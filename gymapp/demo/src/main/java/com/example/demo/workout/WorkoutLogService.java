package com.example.demo.workout;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.Role;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.notification.NotificationService;
import com.example.demo.notification.NotificationType;
import com.example.demo.storage.FileStorage;
import com.example.demo.workout.dto.WorkoutLogRequest;
import com.example.demo.workout.dto.WorkoutLogResponse;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class WorkoutLogService {

    private final WorkoutLogRepository logRepo;
    private final MemberRepository memberRepo;
    private final FileStorage fileStorage;
    private final NotificationService notiService;

    // ✅ 생성 (권한 체크 추가)
    public WorkoutLogResponse create(Long memberId, WorkoutLogRequest req) {
        checkWritePermission(memberId); // 🔒 작성 권한 확인
        
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원 없음: " + memberId));

        String mediaUrl = null;
        String mediaType = null;
        MultipartFile file = req.media();

        if (file != null && !file.isEmpty()) {
            mediaUrl = fileStorage.save(file);
            String contentType = file.getContentType();
            mediaType = (contentType != null && contentType.startsWith("video")) ? "VIDEO" : "IMAGE";
        }

        WorkoutLog log = WorkoutLog.builder()
                .member(member)
                .title(req.title())
                .content(req.content())
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .build();

        logRepo.save(log);
        
        // 🔔 알림 추가
        notiService.create(memberId, NotificationType.SUCCESS, "운동 기록이 작성되었습니다!");
        return toRes(log);
    }

    // ✅ 수정 (권한 체크)
    public WorkoutLogResponse update(Long logId, WorkoutLogRequest req) {
        WorkoutLog log = logRepo.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("운동일지 없음: " + logId));

        checkWritePermission(log.getMember().getId()); // 🔒 수정 권한 확인

        log.setTitle(req.title());
        log.setContent(req.content());

        if (req.media() != null && !req.media().isEmpty()) {
            if (log.getMediaUrl() != null) {
                fileStorage.delete(log.getMediaUrl());
            }
            log.setMediaUrl(fileStorage.save(req.media()));
            log.setMediaType(getMediaType(req.media()));
        }

        // 🔔 알림 추가
        notiService.create(log.getMember().getId(), NotificationType.SUCCESS, "운동 기록이 수정되었습니다!");
        return toRes(log);
    }

    // ✅ 삭제 (권한 체크)
    public void delete(Long logId) {
        WorkoutLog log = logRepo.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("운동일지 없음: " + logId));

        checkWritePermission(log.getMember().getId()); // 🔒 삭제 권한 확인

        if (log.getMediaUrl() != null) {
            fileStorage.delete(log.getMediaUrl());
        }
        logRepo.delete(log);

        // 🔔 알림 추가
        notiService.create(log.getMember().getId(), NotificationType.WARNING, "운동 기록이 삭제되었습니다.");
    }

    // ✅ 조회 (권한 체크)
    @Transactional(readOnly = true)
    public List<WorkoutLogResponse> listByMember(Long memberId) {
        checkReadPermission(memberId); // 🔒 조회 권한 확인
        return logRepo.findByMemberId(memberId).stream()
                .map(this::toRes)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<WorkoutLogResponse> findAll(Pageable pageable) {
        UserPrincipal user = getCurrentUser();
        if (!user.isAdmin()) {
            throw new AccessDeniedException("관리자만 전체 로그를 볼 수 있습니다.");
        }
        return logRepo.findAll(pageable).map(this::toRes);
    }

    @Transactional(readOnly = true)
    public Page<WorkoutLogResponse> search(
            String keyword,
            Long memberId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String mediaType,
            Pageable pageable
    ) {
        if (memberId != null) {
            checkReadPermission(memberId); // 🔒 권한 체크
        }
        return logRepo.search(keyword, memberId, fromDate, toDate, mediaType, pageable)
                .map(this::toRes);
    }

    // ========================
    // 🔒 권한 체크 헬퍼
    // ========================

    /**
     * 작성/수정/삭제 권한 체크: 본인 + 담당 트레이너 + 관리자
     */
    private void checkWritePermission(Long memberId) {
    UserPrincipal user = getCurrentUser();
    
    // 관리자는 모든 회원의 로그 작성 가능
    if (user.isAdmin()) return;
    
    // 담당 트레이너는 담당 회원의 로그 작성 가능
    if (user.isTrainer()) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원 없음: " + memberId));
        if (member.getTrainer() != null && member.getTrainer().getId().equals(user.getId())) {
            return;
        }
    }
    
    // ✅ PT 회원 본인만 자기 로그 작성 가능 (OT는 불가)
    if (user.getId().equals(memberId)) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원 없음: " + memberId));
        if (member.getRole() == Role.PT) {
            return;
        }
        throw new AccessDeniedException("PT 회원만 운동 기록을 작성/수정/삭제할 수 있습니다.");
    }
    
    throw new AccessDeniedException("해당 회원의 운동 일지를 작성/수정/삭제할 권한이 없습니다.");
}

/**
 * 조회 권한 체크: 본인 + 담당 트레이너 + 관리자
 */
public void checkReadPermission(Long memberId) {
    UserPrincipal user = getCurrentUser();
    
    // 관리자는 모든 회원의 로그 조회 가능
    if (user.isAdmin()) return;
    
    // 본인은 자기 로그 조회 가능 (OT, PT 모두)
    if (user.getId().equals(memberId)) return;
    
    // 트레이너는 담당 회원의 로그 조회 가능
    if (user.isTrainer()) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원 없음: " + memberId));
        if (member.getTrainer() != null && member.getTrainer().getId().equals(user.getId())) {
            return;
        }
    }
    
    throw new AccessDeniedException("해당 회원의 운동 일지를 조회할 권한이 없습니다.");
}

    private UserPrincipal getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }
        return user;
    }

    // ========================
    // 🔧 헬퍼 메서드
    // ========================

    private WorkoutLogResponse toRes(WorkoutLog log) {
        String previewUrl = (log.getMediaUrl() != null)
                ? "/api/workout-logs/" + log.getId() + "/media"
                : null;

        return new WorkoutLogResponse(
                log.getId(),
                log.getMember().getId(),
                log.getTitle(),
                log.getContent(),
                previewUrl,
                log.getMediaType(),
                log.getCreatedAt()
        );
    }

    private String getMediaType(MultipartFile file) {
        String contentType = file.getContentType();
        return (contentType != null && contentType.startsWith("video")) ? "VIDEO" : "IMAGE";
    }
}