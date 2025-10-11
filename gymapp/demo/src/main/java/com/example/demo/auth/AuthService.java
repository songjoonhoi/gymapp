package com.example.demo.auth;

import com.example.demo.auth.dto.AuthRequest;
import com.example.demo.auth.dto.AuthResponse;
import com.example.demo.auth.dto.RegisterRequest;
import com.example.demo.common.enums.Role;
import com.example.demo.common.enums.UserStatus;
import com.example.demo.common.enums.AccountStatus;  // ✨ 추가
import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.authentication.AuthenticationManager; // ✨ 빠진 import 추가
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken; // ✨ 빠진 import 추가
import org.springframework.security.core.Authentication; // ✨ 빠진 import 추가


import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final MemberRepository repo;
    private final PasswordEncoder encoder;
    private final JwtTokenProvider jwt;

    // ✨ 회원가입 (전체 교체)
    public void register(RegisterRequest req) {
        // ✨ 1. 전화번호 중복 체크
        Optional<Member> existingMember = repo.findByPhone(req.phone());
        
        if (existingMember.isPresent()) {
            Member member = existingMember.get();
            
            // PENDING 상태면 활성화 가능
            if (member.getAccountStatus() == AccountStatus.PENDING) {
                // 이메일 업데이트
                if (req.email() != null && !req.email().isEmpty()) {
                    if (repo.existsByEmail(req.email())) {
                        throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
                    }
                    member.setEmail(req.email());
                }
                
                // 비밀번호 업데이트
                if (req.password() != null && !req.password().isEmpty()) {
                    member.setPassword(encoder.encode(req.password()));
                }
                
                // 성별, 나이 업데이트
                if (req.gender() != null) {
                    member.setGender(req.gender());
                }
                // ✨ age 대신 dateOfBirth로 수정
                if (req.dateOfBirth() != null) {
                    member.setDateOfBirth(req.dateOfBirth());
                }
                
                member.setAccountStatus(AccountStatus.ACTIVE);
                repo.save(member);
                return;
            } else {
                // 이미 ACTIVE 상태면 중복 에러
                throw new IllegalArgumentException("이미 사용중인 전화번호입니다.");
            }
        }
        
        // ✨ 2. 이메일 설정
        String email = req.email();
        if (email == null || email.isEmpty()) {
            email = req.phone() + "@gymapp.com";
        } else {
            if (repo.existsByEmail(email)) {
                throw new IllegalArgumentException("이미 사용중인 이메일입니다.");
            }
        }
        
        // ✨ 3. 비밀번호 설정 (전화번호 뒷자리 4자리)
        String password = req.password();
        if (password == null || password.isEmpty()) {
            password = req.phone().substring(req.phone().length() - 4);
        }
        
        // ✨ 4. 담당 트레이너 설정
        Member trainer = null;
        if (req.trainerId() != null) {
            trainer = repo.findById(req.trainerId())
                    .orElseThrow(() -> new EntityNotFoundException("트레이너를 찾을 수 없습니다."));
            
            if (!trainer.getRole().isTrainer()) {
                throw new IllegalArgumentException("선택한 회원은 트레이너가 아닙니다.");
            }
        }
        
        // ✨ 5. 신규 회원 생성
        Member m = Member.builder()
                .name(req.name())
                .phone(req.phone())
                .email(email)
                .password(encoder.encode(password))
                .gender(req.gender())
                .dateOfBirth(req.dateOfBirth())
                .role(Role.OT)
                .status(UserStatus.ACTIVE)
                .accountStatus(AccountStatus.ACTIVE)
                .trainer(trainer)
                .build();

        repo.save(m);
    }

    // 로그인 (그대로 유지)
    public AuthResponse login(AuthRequest req) {
        Member m = repo.findByEmail(req.email())
                .orElseThrow(() -> new EntityNotFoundException("이메일 없음"));

        if (!encoder.matches(req.password(), m.getPassword())) {
            throw new IllegalArgumentException("비밀번호 불일치");
        }

        String token = jwt.generateToken(m.getId(), m.getEmail(), m.getRole());
        long expiresAt = System.currentTimeMillis() + jwt.getExpirationMs();

        return new AuthResponse("Bearer", token, m.getId(), m.getRole(), expiresAt);
    }
}