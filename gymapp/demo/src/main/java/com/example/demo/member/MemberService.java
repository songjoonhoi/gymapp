package com.example.demo.member;

import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {
    
    private final MemberRepository repo;

    public MemberResponse create(MemberCreateRequest req) {
        if (repo.existsByEmail(req.email())) throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        Member m = Member.builder()
                .name(req.name())
                .email(req.email())
                .phone(req.phone())
                .role(req.role() == null ? Role.OT : req.role())
                .status(UserStatus.ACTIVE)
                .build();
        return toRes(repo.save(m));
    }

    @Transactional(readOnly = true)
    public MemberResponse get(Long id) {
        return toRes(find(id));
    }

    @Transactional(readOnly = true)
    public Page<MemberResponse> list(Pageable pageable) {
        return repo.findAll(pageable).map(this::toRes);
    }

    public MemberResponse update(Long id, MemberUpdateRequest req) {
        Member m = find(id);
        if (req.name() != null)  m.setName(req.name());
        if (req.phone() != null) m.setPhone(req.phone());
        if (req.role() != null)  m.setRole(req.role());
        return toRes(m);
    }

    // 소프트 삭제: 엔티티의 @SQLDelete가 deleted_at을 채움
    public void delete(Long id) {
        repo.delete(find(id));
    }

    private Member find(Long id) {
        return repo.findById(id).orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + id));
    }

    private MemberResponse toRes(Member m) {
        return new MemberResponse(
                m.getId(), m.getName(), m.getEmail(), m.getPhone(),
                m.getRole(), m.getStatus(), m.getCreatedAt(), m.getUpdatedAt()
        );
    }
    
}
