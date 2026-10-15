package com.voltix.security;

import com.voltix.entity.User;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Integer userId;
    private final String name;
    private final String email;
    private final String password;
    private final String role;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;

    public UserPrincipal(Integer userId, String name, String email, String password, String role,
                         Collection<? extends GrantedAuthority> authorities, boolean active) {
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.authorities = authorities;
        this.active = active;
    }

    public static UserPrincipal create(User user) {
        String roleName = user.getRole();
        java.util.List<GrantedAuthority> authorities = new java.util.ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + roleName.toUpperCase()));
        if ("USER".equalsIgnoreCase(roleName)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_DRIVER"));
        } else if ("DRIVER".equalsIgnoreCase(roleName)) {
            authorities.add(new SimpleGrantedAuthority("ROLE_USER"));
        }

        return new UserPrincipal(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPasswordHash(),
                user.getRole(),
                authorities,
                "ACTIVE".equalsIgnoreCase(user.getStatus())
        );
    }

    public Integer getUserId() { return userId; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
