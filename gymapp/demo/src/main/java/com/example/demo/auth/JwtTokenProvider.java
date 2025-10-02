package com.example.demo.auth;

import com.example.demo.common.enums.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long expirationMs;

    public JwtTokenProvider(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // ✅ Role Enum 직접 사용
    public String generateToken(Long memberId, String email, Role role) {
        long now = System.currentTimeMillis();
        return Jwts.builder()
                .setSubject(email)
                .setClaims(Map.of("id", memberId, "role", role.name()))
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(now + expirationMs))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Authentication getAuthentication(String token) {
        Jws<Claims> jws = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);

        Long id = jws.getBody().get("id", Long.class);
        String email = jws.getBody().getSubject();
        String roleStr = jws.getBody().get("role", String.class);
        Role role = Role.valueOf(roleStr); // ✅ Enum 변환

        UserPrincipal principal = new UserPrincipal(
                id,
                email,
                role,
                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
        );

        return new UsernamePasswordAuthenticationToken(principal, token, principal.getAuthorities());
    }

    public boolean validate(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public long getExpirationMs() {
        return expirationMs;
    }
}
