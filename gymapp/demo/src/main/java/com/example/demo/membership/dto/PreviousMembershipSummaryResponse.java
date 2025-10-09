package com.example.demo.membership.dto;

import java.time.LocalDateTime;

public record PreviousMembershipSummaryResponse(
    LocalDateTime registrationDate,
    Integer ptSessionCount,
    Integer serviceSessionCount,
    Integer paymentAmount
) {}