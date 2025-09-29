package com.example.demo.membership;

import com.example.demo.common.enums.Role;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.membership.dto.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public MembershipResponse getByMemberId(Long memberId) {
        Membership m = findOrCreate(memberId); // 없으면 0세션으로 생성
        return toRes(m);
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

    @Transactional(readOnly = true)
    public List<LowRemainItem> lowRemainList(int threshold) {
        // 간단 구현: membership 전체 스캔 (데모 단계)
        return membershipRepository.findAll().stream()
                .filter(m -> m.isLowRemain(threshold))
                .map(m -> new LowRemainItem(
                        m.getMember().getId(),
                        m.getMember().getName(),
                        m.getMember().getPhone(),
                        m.remainPT()
                ))
                .toList();
    }

    // ---- helpers ----
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