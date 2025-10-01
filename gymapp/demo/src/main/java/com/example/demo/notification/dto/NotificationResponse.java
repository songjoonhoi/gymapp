package com.example.demo.notification.dto;

import com.example.demo.notification.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
        Long id,
        Long memberId,
        NotificationType type,
        String message,
        boolean read,
        LocalDateTime createdAt
) {}
