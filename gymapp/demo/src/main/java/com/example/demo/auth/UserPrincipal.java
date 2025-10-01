package com.example.demo.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import com.example.demo.common.enums.Role;

import java.util.Collection;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {
    private final Long id;
    private final String email;
    private final String role; // DB에는 String으로 저장된 Role
    private final Collection<? extends GrantedAuthority> authorities;

    @Override
    public String getPassword() {
        return ""; // JWT 기반이므로 사용하지 않음
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }

    // ✅ Enum 변환 메서드
    public Role getRoleEnum() {
        return Role.valueOf(this.role);
    }
}
