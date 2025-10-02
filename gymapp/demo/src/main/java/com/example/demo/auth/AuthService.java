package com.example.demo.auth;

import com.example.demo.auth.dto.AuthRequest;
import com.example.demo.auth.dto.AuthResponse;
import com.example.demo.auth.dto.RegisterRequest;
import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final MemberRepository repo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;

    // ✅ 회원가입
    public void register(RegisterRequest req) {
        if (repo.existsByEmail(req.email())) {
            throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        }

        Member m = Member.builder()
                .name(req.name())
                .phone(req.phone())
                .email(req.email())
                .password(encoder.encode(req.password())) // ✅ 해시 저장
                .role(Role.OT) // 기본값: OT
                .status(UserStatus.ACTIVE)
                .build();

        repo.save(m);
    }

    // ✅ 로그인
    public AuthResponse login(AuthRequest req) {
        Member m = repo.findByEmail(req.email())
                .orElseThrow(() -> new EntityNotFoundException("이메일 없음"));

        if (!encoder.matches(req.password(), m.getPassword())) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }

        // ✅ Enum Role을 그대로 전달
        String token = jwt.generateToken(m.getId(), m.getEmail(), m.getRole());
        long expiresAt = System.currentTimeMillis() + jwt.getExpirationMs();

        return new AuthResponse("Bearer", token, m.getId(), m.getRole(), expiresAt);
    }
}
