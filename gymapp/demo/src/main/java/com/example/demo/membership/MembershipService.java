package com.example.demo.membership;

import com.example.demo.auth.UserPrincipal;
import com.example.demo.common.enums.Role;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.membership.dto.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final MemberRepository memberRepository;

    // ✅ 멤버십 조회 (권한 체크 포함)
    @Transactional(readOnly = true)
    public MembershipResponse getByMemberIdWithPermission(Long memberId, UserPrincipal user) {
        checkViewPermission(memberId, user);
        Membership m = findOrCreate(memberId);
        return toRes(m);
    }

    @Transactional(readOnly = true)
    public MembershipResponse getByMemberId(Long memberId) {
        Membership m = findOrCreate(memberId);
        return toRes(m);
    }

    // ✅ PT 세션 등록 (권한 체크 포함)
    public MembershipResponse registerWithPermission(Long memberId, MembershipRegisterRequest req, UserPrincipal user) {
        checkTrainerPermission(memberId, user);
        return register(memberId, req);
    }

    public MembershipResponse register(Long memberId, MembershipRegisterRequest req) {
        Member member = findMember(memberId);
        Membership m = membershipRepository.findByMemberId(memberId).orElseGet(() -> {
            Membership created = Membership.builder()
                    .member(member)
                    .ptTotal(0).ptUsed(0)
                    .svcTotal(0).svcUsed(0)
                    .build();
            return membershipRepository.save(created);
        });
        m.addSessions(req.addPT(), req.addService(), req.startDate(), req.endDate());

        // OT -> PT 자동 승급 (정규 PT가 하나라도 생기면)
        if (m.hasAnyPT() && member.getRole() == Role.OT) {
            member.setRole(Role.PT);
        }
        return toRes(m);
    }

    // ✅ PT 세션 차감 (권한 체크 포함)
    public MembershipResponse decrementWithPermission(Long memberId, MembershipDecrementRequest req, UserPrincipal user) {
        checkTrainerPermission(memberId, user);
        return decrement(memberId, req);
    }

    public MembershipResponse decrement(Long memberId, MembershipDecrementRequest req) {
        Member member = findMember(memberId);
        Membership m = findOrCreate(memberId);
        m.decrement(req.type());

        // PT 잔여가 0이 되면 PT -> OT 자동 전환
        if (!m.hasAnyPT() && member.getRole() == Role.PT) {
            member.setRole(Role.OT);
        }
        return toRes(m);
    }

    // ✅ 잔여 적은 회원 알림 (권한 체크 포함)
    @Transactional(readOnly = true)
    public List<LowRemainItem> lowRemainListWithPermission(int threshold, UserPrincipal user) {
        if (user.isAdmin()) {
            // 관리자는 전체 회원 조회
            return lowRemainList(threshold);
        } else if (user.isTrainer()) {
            // 트레이너는 자기 담당 회원만
            return lowRemainListForTrainer(user.getId(), threshold);
        }
        throw new AccessDeniedException("트레이너 또는 관리자만 조회할 수 있습니다.");
    }

    @Transactional(readOnly = true)
    public List<LowRemainItem> lowRemainList(int threshold) {
        return membershipRepository.findAll().stream()
                .filter(m -> {
                    // ✅ PT 회원만 필터링 (OT 제외)
                    if (m.getMember().getRole() != Role.PT) {
                        return false;
                    }
                    // ✅ 잔여 PT가 threshold 이하인 회원 (0 포함)
                    return m.remainPT() <= threshold;
                })
                .map(m -> new LowRemainItem(
                        m.getMember().getId(),
                        m.getMember().getName(),
                        m.getMember().getPhone(),
                        m.remainPT()
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<LowRemainItem> lowRemainListForTrainer(Long trainerId, int threshold) {
        return membershipRepository.findAll().stream()
                .filter(m -> {
                    Member member = m.getMember();
                    // ✅ PT 회원만 필터링
                    if (member.getRole() != Role.PT) {
                        return false;
                    }
                    // ✅ 담당 트레이너인지 확인
                    if (member.getTrainer() == null || !member.getTrainer().getId().equals(trainerId)) {
                        return false;
                    }
                    // ✅ 잔여 PT가 threshold 이하인 회원 (0 포함)
                    return m.remainPT() <= threshold;
                })
                .map(m -> new LowRemainItem(
                        m.getMember().getId(),
                        m.getMember().getName(),
                        m.getMember().getPhone(),
                        m.remainPT()
                ))
                .toList();
    }

    // ========================
    // 🔒 권한 체크 헬퍼
    // ========================

    /**
     * 조회 권한 체크: 본인 + 담당 트레이너 + 관리자
     */
    private void checkViewPermission(Long memberId, UserPrincipal user) {
        // 관리자는 모든 회원 조회 가능
        if (user.isAdmin()) return;

        // 본인은 자기 멤버십 조회 가능
        if (user.getId().equals(memberId)) return;

        // 트레이너는 담당 회원만 조회 가능
        if (user.isTrainer()) {
            Member member = findMember(memberId);
            if (member.getTrainer() != null && member.getTrainer().getId().equals(user.getId())) {
                return;
            }
        }

        throw new AccessDeniedException("해당 회원의 멤버십을 조회할 권한이 없습니다.");
    }

    /**
     * 등록/차감 권한 체크: 담당 트레이너 + 관리자만
     */
    private void checkTrainerPermission(Long memberId, UserPrincipal user) {
        // 관리자는 모든 회원 관리 가능
        if (user.isAdmin()) return;

        // 트레이너는 담당 회원만 관리 가능
        if (user.isTrainer()) {
            Member member = findMember(memberId);
            if (member.getTrainer() != null && member.getTrainer().getId().equals(user.getId())) {
                return;
            }
        }

        throw new AccessDeniedException("해당 회원의 PT 세션을 관리할 권한이 없습니다.");
    }

    // ========================
    // 🔧 헬퍼 메서드
    // ========================

    private Member findMember(Long memberId) {
        return memberRepository.findById(memberId)
                .orElseThrow(() -> new EntityNotFoundException("회원이 없습니다: " + memberId));
    }

    private Membership findOrCreate(Long memberId) {
        Member member = findMember(memberId);
        return membershipRepository.findByMemberId(memberId).orElseGet(() -> {
            Membership created = Membership.builder()
                    .member(member)
                    .ptTotal(0).ptUsed(0)
                    .svcTotal(0).svcUsed(0)
                    .build();
            return membershipRepository.save(created);
        });
    }

    private MembershipResponse toRes(Membership m) {
        return new MembershipResponse(
                m.getMember().getId(),
                m.getPtTotal(), m.getPtUsed(), m.remainPT(),
                m.getSvcTotal(), m.getSvcUsed(), m.remainService(),
                m.remainTotal(),
                m.getStartDate(), m.getEndDate()
        );
    }
}