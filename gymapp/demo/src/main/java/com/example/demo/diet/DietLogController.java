package com.example.demo.diet;

import com.example.demo.diet.dto.DietLogRequest;
import com.example.demo.diet.dto.DietLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/diet-logs")
public class DietLogController {

    private final DietLogService service;

    @PostMapping("/{memberId}")
    public DietLogResponse create(@PathVariable Long memberId,
                                  @RequestParam String title,
                                  @RequestParam String content,
                                  @RequestParam(required = false) MultipartFile media) {
        return service.create(memberId, new DietLogRequest(title, content, media));
    }

    // 회원별 목록
    @GetMapping("/{memberId}")
    public List<DietLogResponse> listByMember(@PathVariable Long memberId) {
        return service.listByMember(memberId);
    }

    // 전체 목록 페이지네이션
    @GetMapping
    public Page<DietLogResponse> list(@RequestParam(defaultValue = "0") int page,
                                      @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return service.findAll(pageable);
    }
}
