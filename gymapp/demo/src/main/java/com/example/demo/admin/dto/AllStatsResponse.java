package com.example.demo.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AllStatsResponse {
    private Long totalMembers;
    private Long activeMembers;
    private Long inactiveMembers;
    private Long recentJoined;
    private Map<String, Long> roleDistribution;
    private List<TrainerStatsResponse> trainerStats;
    private List<MonthlyJoinedResponse> monthlyJoined;
    private Long totalWorkoutLogs;
    private Long totalDietLogs;
    private Long totalPtSessions;
    private Double avgWorkoutPerMember;
    private Double avgDietPerMember;
    private Double avgPtPerMember;
    private Double ptConversionRate;
    private Double avgTraineePerTrainer;
    private Long thisMonthJoined;
}