package com.example.demo.notification;

import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.notification.dto.NotificationResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepo;
    private final MemberRepository memberRepo;

    // 🔔 알림 생성
    public NotificationResponse create(Long memberId, NotificationType type, String message) {
        Member member = memberRepo.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + memberId));

        Notification notification = Notification.builder()
                .member(member)
                .type(type)
                .message(message)
                .build();

        Notification saved = notificationRepo.save(notification);
        return toResponse(saved);
    }

    // 🔔 특정 회원의 전체 알림 조회
    @Transactional(readOnly = true)
    public List<NotificationResponse> getAll(Long memberId) {
        return notificationRepo.findByMemberIdOrderByCreatedAtDesc(memberId).stream()
                .map(this::toResponse)
                .toList();
    }

    // 🔔 읽지 않은 알림 조회
    @Transactional(readOnly = true)
    public List<NotificationResponse> getUnread(Long memberId) {
        return notificationRepo.findByMemberIdAndIsReadFalseOrderByCreatedAtDesc(memberId).stream()
                .map(this::toResponse)
                .toList();
    }

    // 🔔 읽지 않은 알림 개수
    @Transactional(readOnly = true)
    public long countUnread(Long memberId) {
        return notificationRepo.countByMemberIdAndIsReadFalse(memberId);
    }

    // 🔔 모든 알림 읽음 처리
    public void markAllAsRead(Long memberId) {
        List<Notification> notifications =
                notificationRepo.findByMemberIdAndIsReadFalseOrderByCreatedAtDesc(memberId);
        notifications.forEach(n -> n.setRead(true));
        notificationRepo.saveAll(notifications);
    }

    // 🔄 Entity → DTO 변환 메서드
    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getId(),
                n.getMember().getId(),
                n.getType(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt()
        );
    }
}
