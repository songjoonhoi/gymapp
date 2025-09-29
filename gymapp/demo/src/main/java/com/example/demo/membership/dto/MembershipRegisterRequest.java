package com.example.demo.membership.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record MembershipRegisterRequest(
        @NotNull @Min(0) Integer addPT,
        @NotNull @Min(0) Integer addService,
        LocalDate startDate,
        LocalDate endDate,
        Integer amount // 추후 결제 테이블 분리 예정, 일단 보관용
) {}
