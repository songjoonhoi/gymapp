package com.example.demo.diet;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DietCommentRepository extends JpaRepository<DietComment, Long> {
    
    // 특정 식단일지의 모든 댓글을 작성 시간순으로 조회
    List<DietComment> findByDietLogIdOrderByCreatedAtAsc(Long dietLogId);

    List<DietComment> findByDietLogId(Long dietLogId);
}