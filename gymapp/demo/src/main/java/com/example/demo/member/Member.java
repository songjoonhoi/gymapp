package com.example.demo.member;

import com.example.demo.common.BaseEntity;
import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.membership.Membership;
import com.example.demo.common.enums.Gender;           // ✨ 추가
import com.example.demo.common.enums.AccountStatus;    // ✨ 추가
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

import java.time.LocalDate;  // ✨ 추가

@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor 
@Builder
@Entity 
@Table(name = "members",
       indexes = { 
           @Index(name="idx_member_email", columnList = "email", unique = true),
           @Index(name="idx_member_phone", columnList = "phone")  // ✨ 전화번호 인덱스 추가
       })
@SQLDelete(sql = "UPDATE members SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Member extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 120, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status;

    // ✨ 새로 추가되는 필드들
    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    private Gender gender;

    @Column(name = "date_of_birth") // ✨ 이 라인을 추가합니다.
    private LocalDate dateOfBirth;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AccountStatus accountStatus = AccountStatus.ACTIVE;

    @Column(length = 100)
    private String membershipType;  // 회원권 (예: "3개월권", "1년권")

    private LocalDate registrationDate;  // 가입일

    private LocalDate startDate;  // 시작일

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trainer_id")
    private Member trainer;

    // ✅ 회원권과의 1:1 관계 (양방향)
    @OneToOne(mappedBy = "member", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private Membership membership;
}