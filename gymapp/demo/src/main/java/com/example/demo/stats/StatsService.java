package com.example.demo.stats;

import com.example.demo.diet.DietLogRepository;
import com.example.demo.workout.WorkoutLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {

    private final DietLogRepository dietRepo;
    private final WorkoutLogRepository workoutRepo;

    public Map<String, Object> getMemberStats(Long memberId) {
        Map<String, Object> stats = new HashMap<>();

        // 🥗 Diet 로그
        long dietCount = dietRepo.countByMemberId(memberId);
        LocalDateTime dietLast = dietRepo.findLastCreatedAt(memberId);
        List<Object[]> dietMediaStats = dietRepo.countByMediaType(memberId);

        // 🏋️ Workout 로그
        long workoutCount = workoutRepo.countByMemberId(memberId);
        LocalDateTime workoutLast = workoutRepo.findLastCreatedAt(memberId);
        List<Object[]> workoutMediaStats = workoutRepo.countByMediaType(memberId);

        stats.put("dietCount", dietCount);
        stats.put("dietLast", dietLast);
        stats.put("dietMediaStats", dietMediaStats);

        stats.put("workoutCount", workoutCount);
        stats.put("workoutLast", workoutLast);
        stats.put("workoutMediaStats", workoutMediaStats);

        return stats;
    }
}
