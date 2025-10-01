package com.example.demo.notification;

import com.example.demo.notification.dto.NotificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // 🔔 전체 알림 조회
    @GetMapping("/{memberId}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<NotificationResponse> getAll(@PathVariable Long memberId) {
        return notificationService.getAll(memberId);
    }

    // 🔔 읽지 않은 알림 조회
    @GetMapping("/{memberId}/unread")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public List<NotificationResponse> getUnread(@PathVariable Long memberId) {
        return notificationService.getUnread(memberId);
    }

    // 🔔 읽지 않은 알림 개수
    @GetMapping("/{memberId}/unread-count")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public long countUnread(@PathVariable Long memberId) {
        return notificationService.countUnread(memberId);
    }

    // 🔔 모든 알림 읽음 처리
    @PutMapping("/{memberId}/mark-all-read")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public void markAllAsRead(@PathVariable Long memberId) {
        notificationService.markAllAsRead(memberId);
    }
}
