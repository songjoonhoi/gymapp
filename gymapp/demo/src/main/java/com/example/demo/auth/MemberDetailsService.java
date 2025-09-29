package com.example.demo.auth;

import com.example.demo.member.Member;
import com.example.demo.member.MemberRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MemberDetailsService implements UserDetailsService {
    private final MemberRepository repo;

    @Override
    public UserDetails loadUserByUsername(String email) {
        Member m = repo.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("이메일 없음: " + email));
        return new MemberDetails(m);
    }
}
