package com.example.demo.membership;

import com.example.demo.common.BaseEntity;
import com.example.demo.common.enums.Role;
import com.example.demo.member.Member;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
@Entity @Table(name = "memberships", uniqueConstraints = {
        @UniqueConstraint(name="uq_membership_member", columnNames = {"member_id"})
})
@SQLDelete(sql = "UPDATE memberships SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Membership extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "member_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE) // 🔥 DB와 동일하게 회원 삭제 시 자동 삭제
    private Member member;
    // 정규 PT
    @Column(nullable = false) private int ptTotal;
    @Column(nullable = false) private int ptUsed;

    // 서비스 세션
    @Column(nullable = false) private int svcTotal;
    @Column(nullable = false) private int svcUsed;

    private LocalDate startDate;
    private LocalDate endDate;

    // helper
    public int remainPT() { return Math.max(0, ptTotal - ptUsed); }
    public int remainService() { return Math.max(0, svcTotal - svcUsed); }
    public int remainTotal() { return remainPT() + remainService(); }

    public void addSessions(int addPT, int addSvc, LocalDate start, LocalDate end) {
        if (addPT < 0 || addSvc < 0) throw new IllegalArgumentException("추가 세션은 0 이상이어야 합니다.");
        this.ptTotal += addPT;
        this.svcTotal += addSvc;
        if (start != null) this.startDate = start;
        if (end != null) this.endDate = end;
    }

    public void decrement(SessionType type) {
        if (type == SessionType.REGULAR) {
            if (remainPT() <= 0) throw new IllegalStateException("차감할 정규 PT 잔여가 없습니다.");
            this.ptUsed += 1;
        } else {
            if (remainService() <= 0) throw new IllegalStateException("차감할 서비스 세션 잔여가 없습니다.");
            this.svcUsed += 1;
        }
    }

    public boolean isLowRemain(int threshold) {
        // 기획: "PT 잔여 ≤ threshold"만 강조
        return remainPT() <= threshold;
    }

    public boolean hasAnyPT() {
        return ptTotal - ptUsed > 0;
    }
}
