package com.restaurant.urbanzestaurant.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.AuthResponse;
import com.restaurant.urbanzestaurant.dto.LoginRequest;
import com.restaurant.urbanzestaurant.dto.RegisterRequest;
import com.restaurant.urbanzestaurant.entity.User;
import com.restaurant.urbanzestaurant.repository.UserRepository;

import jakarta.transaction.Transactional;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private JwtService jwtService;
    @Autowired
    private AuthenticationManager authManager;

    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        userRepository.save(user);
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    public AuthResponse login(LoginRequest request) {
        authManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        User user = userRepository.findActiveByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found or deactivated"));
        String token = jwtService.generateToken(user);
        return new AuthResponse(token);
    }

    // New methods for user management
    public List<User> getAllActiveUsers() {
        return userRepository.findAllActive();
    }

    public List<User> getAllUsersIncludingDeleted() {
        return userRepository.findAllIncludingDeleted();
    }

    @Transactional
    public void softDeleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    @Transactional
    public void restoreUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setDeletedAt(null);
        userRepository.save(user);
    }
}

