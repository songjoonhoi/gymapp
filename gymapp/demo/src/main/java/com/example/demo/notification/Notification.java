package com.example.demo.notification;

import com.example.demo.member.Member;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notification")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;  // 알림 대상 회원

    @Enumerated(EnumType.STRING)
    private NotificationType type; // SUCCESS, WARNING, INFO, ADMIN_NOTICE

    private String message; // 알림 내용

    @Column(name = "is_read", nullable = false)
    private boolean isRead; // 읽음 여부

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }
}
