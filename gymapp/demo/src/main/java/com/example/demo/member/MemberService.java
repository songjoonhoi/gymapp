package com.example.demo.member;

import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import com.example.demo.member.dto.PasswordChangeRequest;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;


@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {
    
    private final MemberRepository repo;
    private final PasswordEncoder passwordEncoder;

    public MemberResponse create(MemberCreateRequest req) {
    if (repo.existsByEmail(req.email())) {
        throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
    }

    Member m = Member.builder()
            .name(req.name())
            .email(req.email())
            .phone(req.phone())
            .password(passwordEncoder.encode(req.password())) // ✅ 해시 저장
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

    // ✅ 비밀번호 변경
    public void changePassword(Long memberId, PasswordChangeRequest req) {
        Member m = find(memberId);

        if (!passwordEncoder.matches(req.currentPassword(), m.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        m.setPassword(passwordEncoder.encode(req.newPassword()));
    }

    // ✅ update 보강
    public MemberResponse update(Long id, MemberUpdateRequest req) {
        Member m = find(id);

        if (req.name() != null) m.setName(req.name());

        if (req.phone() != null) {
            if (repo.existsByPhone(req.phone()) && !req.phone().equals(m.getPhone())) {
                throw new IllegalArgumentException("이미 사용 중인 전화번호입니다.");
            }
            m.setPhone(req.phone());
        }

        if (req.role() != null) m.setRole(req.role());

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
            m.getId(),
            m.getName(),
            m.getEmail(),
            m.getPhone(),
            m.getRole(),
            m.getStatus(),
            m.getCreatedAt(),
            m.getUpdatedAt(),
            m.getTrainer() != null ? m.getTrainer().getId() : null  // ✅ 추가
    );
}
    
    // ✅ 트레이너 배정/변경
    public void assignTrainer(Long memberId, Long trainerId) {
        Member member = find(memberId);
        Member trainer = find(trainerId);

        if (trainer.getRole() != Role.TRAINER) {
            throw new IllegalArgumentException("선택된 회원은 트레이너가 아닙니다.");
        }

        member.setTrainer(trainer);
        repo.save(member);
    }

    // ✅ 트레이너가 맡은 회원 조회
    @Transactional(readOnly = true)
    public List<MemberResponse> getTrainees(Long trainerId) {
        return repo.findByTrainerId(trainerId)
                .stream()
                .map(this::toRes)
                .toList();
    }

}
