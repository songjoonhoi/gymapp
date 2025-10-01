package com.example.demo.ai;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class AiNutritionService {

    private final String apiKey = "YOUR_AI_API_KEY"; // 🔹 properties 로 주입하는 게 안전

    public Map<String, Object> analyzeFood(String imageUrl) {
        RestTemplate restTemplate = new RestTemplate();

        // ✅ OpenAI Vision 또는 Gemini API 요청 Body 예시
        Map<String, Object> request = Map.of(
                "model", "gpt-4o-mini",   // 이미지 인식 지원 모델
                "input", "이 음식 사진을 보고 칼로리와 주요 영양소(탄수화물, 단백질, 지방)를 알려줘: " + imageUrl
        );

        // ⚠️ 실제 엔드포인트 & 인증 헤더 필요 (여기선 구조 예시만)
        Map<String, Object> response = restTemplate.postForObject(
                "https://api.openai.com/v1/responses",
                request,
                Map.class
        );

        return response;
    }
}
