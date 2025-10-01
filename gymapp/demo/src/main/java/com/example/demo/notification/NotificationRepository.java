package com.example.demo.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // 특정 회원의 전체 알림 조회 (최신순)
    List<Notification> findByMemberIdOrderByCreatedAtDesc(Long memberId);

    // 특정 회원의 안 읽은 알림 조회 (최신순)
    List<Notification> findByMemberIdAndIsReadFalseOrderByCreatedAtDesc(Long memberId);

    // 안 읽은 알림 개수
    long countByMemberIdAndIsReadFalse(Long memberId);
}
