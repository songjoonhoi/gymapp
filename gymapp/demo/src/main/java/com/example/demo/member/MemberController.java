package com.example.demo.member;

import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/members")
public class MemberController {
    
    private final MemberService service;

    @PostMapping
    public MemberResponse create(@RequestBody @Valid MemberCreateRequest req) {
        return service.create(req);
    }

    @GetMapping("/{id}")
    public MemberResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @GetMapping
    public Page<MemberResponse> list(@RequestParam(defaultValue = "0") int page,
                                     @RequestParam(defaultValue = "10") int size) {
        return service.list(PageRequest.of(page, size));
    }

    @PutMapping("/{id}")
    public MemberResponse update(@PathVariable Long id,
                                 @RequestBody MemberUpdateRequest req) {
        return service.update(id, req);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id); // 소프트 삭제
    }


}
