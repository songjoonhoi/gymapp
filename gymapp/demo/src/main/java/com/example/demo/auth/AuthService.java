// com.example.demo.auth.AuthService.java
package com.example.demo.auth;

import com.example.demo.auth.dto.AuthRequest;
import com.example.demo.auth.dto.AuthResponse;
import com.example.demo.auth.dto.RegisterRequest;
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import com.example.demo.common.enums.Role;
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

    public void register(RegisterRequest req){
        if (repo.existsByEmail(req.email())) throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
        Member m = Member.builder()
                .name(req.name())
                .phone(req.phone())
                .email(req.email())
                .password(encoder.encode(req.password()))
                .role(Role.OT) // 기본: OT
                .build();
        repo.save(m);
    }

    public AuthResponse login(AuthRequest req){
        Member m = repo.findByEmail(req.email()).orElseThrow(() -> new EntityNotFoundException("이메일 없음"));
        if (!encoder.matches(req.password(), m.getPassword())) throw new IllegalArgumentException("비밀번호 불일치");

        String token = jwt.generateToken(m.getId(), m.getEmail(), m.getRole().name());
        long expiresAt = System.currentTimeMillis() + jwt.getExpirationMs();
        return new AuthResponse("Bearer", token, m.getId(), m.getRole().name(), expiresAt);
    }
}
