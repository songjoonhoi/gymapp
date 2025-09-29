package com.example.demo.member;

import com.example.demo.common.BaseEntity;
import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;

@Getter 
@Setter
@NoArgsConstructor
@AllArgsConstructor 
@Builder
@Entity 
@Table(name = "members",
       indexes = { @Index(name="idx_member_email", columnList = "email", unique = true) })
@SQLDelete(sql = "UPDATE members SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class Member extends BaseEntity {

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 120, unique = true)
    private String email;

    @Column(nullable = false)
    private String password; // BCrypt로 해시 저장

    @Column(length = 20)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role; // OT/PT/TRAINER/ADMIN

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private UserStatus status; // ACTIVE/INACTIVE
}
