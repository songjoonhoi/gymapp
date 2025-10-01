package com.example.demo.diet;

import com.example.demo.ai.AiNutritionService;
import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.Role;
import com.example.demo.diet.dto.DietLogRequest;
import com.example.demo.diet.dto.DietLogResponse;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.notification.NotificationService;
import com.example.demo.notification.NotificationType;
import com.example.demo.storage.FileStorage;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DietLogService {

    private final DietLogRepository logRepo;
    private final MemberRepository memberRepo;
    private final FileStorage fileStorage;
    private final NotificationService notiService;
    private final AiNutritionService aiService;

    // ✅ 생성
    public DietLogResponse create(Long memberId, DietLogRequest req) {
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

        // ✅ AI 분석 (칼로리만 저장)
        Integer calories = null;
        String aiCalories = null;
        String aiNutrition = null;
        if (mediaUrl != null && "IMAGE".equals(mediaType)) {
            try {
                var aiResult = aiService.analyzeFood(mediaUrl);
                aiCalories = aiResult.getOrDefault("calories", "0").toString();
                calories = Integer.parseInt(aiCalories.replaceAll("[^0-9]", ""));
                aiNutrition = aiResult.getOrDefault("nutrition", "분석 실패").toString();
            } catch (Exception e) {
                calories = null;
                aiCalories = "분석 오류";
                aiNutrition = "분석 오류";
            }
        }

        DietLog log = DietLog.builder()
                .member(member)
                .title(req.title())
                .content(req.content())
                .mediaUrl(mediaUrl)
                .mediaType(mediaType)
                .calories(calories)   // ✅ DB 저장
                .build();

        logRepo.save(log);

        // 🔔 알림 추가
        notiService.create(memberId, NotificationType.SUCCESS, "식단 기록이 작성되었습니다!");

        // ✅ AI 결과 포함한 응답
        return new DietLogResponse(
                log.getId(),
                log.getMember().getId(),
                log.getTitle(),
                log.getContent(),
                mediaUrl,
                mediaType,
                log.getCalories(),
                aiCalories,
                aiNutrition,
                log.getCreatedAt()
        );
    }

    // ✅ 수정 (본인 + 관리자)
    public DietLogResponse update(Long logId, DietLogRequest req) {
        DietLog log = logRepo.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("식단일지 없음: " + logId));

        checkOwner(log.getMember().getId()); // 🔒 권한 확인

        log.setTitle(req.title());
        log.setContent(req.content());

        if (req.media() != null && !req.media().isEmpty()) {
            if (log.getMediaUrl() != null) {
                fileStorage.delete(log.getMediaUrl());
            }
            log.setMediaUrl(fileStorage.save(req.media()));
            log.setMediaType(getMediaType(req.media()));
        }

        notiService.create(log.getMember().getId(), NotificationType.SUCCESS, "식단 기록이 수정되었습니다!");
        return toRes(log);
    }

    // ✅ 삭제 (본인 + 관리자)
    public void delete(Long logId) {
        DietLog log = logRepo.findById(logId)
                .orElseThrow(() -> new EntityNotFoundException("식단일지 없음: " + logId));

        checkOwner(log.getMember().getId()); // 🔒 권한 확인

        if (log.getMediaUrl() != null) {
            fileStorage.delete(log.getMediaUrl());
        }
        logRepo.delete(log);

        notiService.create(log.getMember().getId(), NotificationType.WARNING, "식단 기록이 삭제되었습니다.");
    }

    // ✅ 회원별 조회 (회원 본인 + 담당 트레이너 + 관리자)
    @Transactional(readOnly = true)
    public List<DietLogResponse> listByMember(Long memberId) {
        checkViewPermission(memberId); // 🔒 조회 권한 확인
        return logRepo.findByMemberId(memberId).stream()
                .map(this::toRes)
                .toList();
    }

    // ✅ 전체 조회 (관리자만)
    @Transactional(readOnly = true)
    public Page<DietLogResponse> findAll(Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user) || !user.getRoleEnum().isAdmin()) {
            throw new AccessDeniedException("관리자만 전체 조회가 가능합니다.");
        }
        return logRepo.findAll(pageable).map(this::toRes);
    }

    private DietLogResponse toRes(DietLog log) {
        String previewUrl = (log.getMediaUrl() != null)
                ? "/api/diet-logs/" + log.getId() + "/media"
                : null;

        return new DietLogResponse(
                log.getId(),
                log.getMember().getId(),
                log.getTitle(),
                log.getContent(),
                previewUrl,
                log.getMediaType(),
                log.getCalories(),
                null,
                null,
                log.getCreatedAt()
        );
    }

    private String getMediaType(MultipartFile file) {
        String contentType = file.getContentType();
        return (contentType != null && contentType.startsWith("video")) ? "VIDEO" : "IMAGE";
    }

    // 🔒 본인 확인 (수정/삭제 전용)
    private void checkOwner(Long ownerId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }
        if (user.getRoleEnum().isAdmin()) {
            return;
        }
        if (!user.getId().equals(ownerId)) {
            throw new AccessDeniedException("본인만 수정/삭제할 수 있습니다.");
        }
    }

    // 🔒 조회 권한 확인 (회원 본인 + 담당 트레이너 + 관리자)
    private void checkViewPermission(Long memberId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserPrincipal user)) {
            throw new AccessDeniedException("인증이 필요합니다.");
        }

        if (user.getRoleEnum().isAdmin()) {
            return;
        }
        if (user.getId().equals(memberId)) {
            return;
        }
        if (user.getRoleEnum().isTrainer()) {
            Member member = memberRepo.findById(memberId)
                    .orElseThrow(() -> new EntityNotFoundException("회원 없음: " + memberId));
            if (member.getTrainer() != null && member.getTrainer().getId().equals(user.getId())) {
                return;
            }
        }
        throw new AccessDeniedException("조회 권한이 없습니다.");
    }

    // ✅ 검색/필터링 (조회 권한 적용)
    @Transactional(readOnly = true)
    public Page<DietLogResponse> search(
            String keyword,
            Long memberId,
            LocalDateTime fromDate,
            LocalDateTime toDate,
            String mediaType,
            Pageable pageable
    ) {
        if (memberId != null) {
            checkViewPermission(memberId);
        }
        return logRepo.search(keyword, memberId, fromDate, toDate, mediaType, pageable)
                .map(this::toRes);
    }

    // ✅ 총 칼로리/기간별 칼로리 조회 (조회 권한 적용)
    @Transactional(readOnly = true)
    public int getTotalCalories(Long memberId) {
        checkViewPermission(memberId);
        return logRepo.findTotalCalories(memberId);
    }

    @Transactional(readOnly = true)
    public int getCaloriesForPeriod(Long memberId, LocalDateTime start, LocalDateTime end) {
        checkViewPermission(memberId);
        return logRepo.findCaloriesBetween(memberId, start, end);
    }

    @Transactional(readOnly = true)
    public int getCaloriesToday(Long memberId) {
        checkViewPermission(memberId);
        LocalDate today = LocalDate.now();
        return logRepo.findCaloriesBetween(memberId, today.atStartOfDay(), today.atTime(LocalTime.MAX));
    }

    @Transactional(readOnly = true)
    public int getCaloriesThisWeek(Long memberId) {
        checkViewPermission(memberId);
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(java.time.DayOfWeek.MONDAY);
        LocalDate endOfWeek = today.with(java.time.DayOfWeek.SUNDAY);
        return logRepo.findCaloriesBetween(memberId, startOfWeek.atStartOfDay(), endOfWeek.atTime(LocalTime.MAX));
    }

    @Transactional(readOnly = true)
    public int getCaloriesThisMonth(Long memberId) {
        checkViewPermission(memberId);
        LocalDate today = LocalDate.now();
        LocalDate firstDay = today.withDayOfMonth(1);
        LocalDate lastDay = today.withDayOfMonth(today.lengthOfMonth());
        return logRepo.findCaloriesBetween(memberId, firstDay.atStartOfDay(), lastDay.atTime(LocalTime.MAX));
    }
}
