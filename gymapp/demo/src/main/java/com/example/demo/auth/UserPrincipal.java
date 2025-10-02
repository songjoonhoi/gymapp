package com.example.demo.auth;

import com.example.demo.common.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String email;
    private final Role role;  // ✅ 이제 Enum 직접 사용
    private final Collection<? extends GrantedAuthority> authorities;

    @Override
    public String getPassword() {
        return ""; // JWT 기반이라 password 직접 안 씀
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }

    // ✅ 헬퍼 메서드 → Controller / Service에서 간결하게 사용 가능
    public boolean isAdmin() { return role.isAdmin(); }
    public boolean isTrainer() { return role.isTrainer(); }
    public boolean isMember() { return role.isMember(); }
}
