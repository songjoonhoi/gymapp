package com.example.demo.member;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.member.dto.MemberCreateRequest;
import com.example.demo.member.dto.MemberResponse;
import com.example.demo.member.dto.MemberUpdateRequest;
import com.example.demo.member.dto.PasswordChangeRequest;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MemberService {

    private final MemberRepository repo;
    private final PasswordEncoder passwordEncoder;

    // ✅ 회원 생성
    public MemberResponse create(MemberCreateRequest req) {
        if (repo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        Member m = Member.builder()
                .name(req.name())
                .email(req.email())
                .phone(req.phone())
                .password(passwordEncoder.encode(req.password()))
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

    // ✅ 권한 적용된 조회
    @Transactional(readOnly = true)
    public MemberResponse getWithPermission(Long id, UserPrincipal user) {
        MemberResponse mr = get(id);
        if (user.isAdmin() || user.getId().equals(id)) {
            return mr;
        }
        if (user.isTrainer() && mr.trainerId() != null && mr.trainerId().equals(user.getId())) {
            return mr;
        }
        throw new AccessDeniedException("접근 권한이 없습니다.");
    }

    @Transactional(readOnly = true)
    public Page<MemberResponse> listWithPermission(Pageable pageable, UserPrincipal user) {
        if (!user.isAdmin()) {
            throw new AccessDeniedException("관리자만 전체 목록을 조회할 수 있습니다.");
        }
        return list(pageable);
    }

    // ✅ 비밀번호 변경 (권한 체크 포함)
    public void changePasswordWithPermission(Long memberId, PasswordChangeRequest req, UserPrincipal user) {
        if (user.isAdmin() || user.getId().equals(memberId)) {
            changePassword(memberId, req);
            return;
        }
        throw new AccessDeniedException("본인만 비밀번호를 변경할 수 있습니다.");
    }

    public void changePassword(Long memberId, PasswordChangeRequest req) {
        Member m = find(memberId);

        if (!passwordEncoder.matches(req.currentPassword(), m.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        m.setPassword(passwordEncoder.encode(req.newPassword()));
    }

    // ✅ 회원 정보 수정
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

    // ✅ 권한 포함 업데이트
    public MemberResponse updateWithPermission(Long id, MemberUpdateRequest req, UserPrincipal user) {
        if (user.isAdmin() || user.getId().equals(id)) {
            return update(id, req);
        }
        throw new AccessDeniedException("본인만 수정할 수 있습니다.");
    }

    // ✅ 소프트 삭제
    public void delete(Long id) {
        repo.delete(find(id));
    }

    // ✅ 권한 포함 삭제
    public void deleteWithPermission(Long id, UserPrincipal user) {
        if (user.isAdmin() || user.getId().equals(id)) {
            delete(id);
            return;
        }
        throw new AccessDeniedException("본인만 삭제할 수 있습니다.");
    }

    private Member find(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + id));
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
                m.getTrainer() != null ? m.getTrainer().getId() : null
        );
    }

    // ✅ 트레이너 배정/변경
    public void assignTrainer(Long memberId, Long trainerId) {
        Member member = find(memberId);
        Member trainer = find(trainerId);

        if (!trainer.getRole().isTrainer()) {
            throw new IllegalArgumentException("선택된 회원은 트레이너가 아닙니다.");
        }

        member.setTrainer(trainer);
        repo.save(member);
    }

    // ✅ 트레이너 담당 회원 조회
    @Transactional(readOnly = true)
    public List<MemberResponse> getTraineesWithPermission(Long trainerId, UserPrincipal user) {
        if (user.isAdmin() || user.getId().equals(trainerId)) {
            return getTrainees(trainerId);
        }
        throw new AccessDeniedException("자신의 회원만 조회할 수 있습니다.");
    }

    @Transactional(readOnly = true)
    public List<MemberResponse> getTrainees(Long trainerId) {
        return repo.findByTrainerId(trainerId)
                .stream()
                .map(this::toRes)
                .toList();
    }
}
