package com.restaurant.urbanzestaurant.config;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.restaurant.urbanzestaurant.entity.User;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class CustomUserDetails implements UserDetails {

    /**
	 * 
	 */
	private static final long serialVersionUID = 3641316435968417948L;
	private final User user;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(user.getRole().name()));
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override 
    public boolean isAccountNonExpired() { 
        return true; 
    }

    @Override 
    public boolean isAccountNonLocked() { 
        return true; 
    }

    @Override 
    public boolean isCredentialsNonExpired() { 
        return true; 
    }

    @Override 
    public boolean isEnabled() { 
        // User is enabled only if not soft deleted
        return user.getDeletedAt() == null; 
    }

    public User getUser() {
        return this.user;
    }
}