package com.example.demo.membership.dto;

import com.example.demo.membership.SessionType;
import jakarta.validation.constraints.NotNull;

public record MembershipDecrementRequest(@NotNull SessionType type) {}
