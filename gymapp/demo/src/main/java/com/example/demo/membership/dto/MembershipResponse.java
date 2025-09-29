package com.example.demo.membership.dto;

import java.time.LocalDate;

public record MembershipResponse(
        Long memberId,
        int ptSessionsTotal, int usedPT, int remainPT,
        int serviceSessionsTotal, int usedService, int remainService,
        int remain, // total remain
        LocalDate startDate, LocalDate endDate
) {}