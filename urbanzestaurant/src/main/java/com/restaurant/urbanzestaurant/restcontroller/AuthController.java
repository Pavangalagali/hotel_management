package com.restaurant.urbanzestaurant.restcontroller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.dto.AuthResponse;
import com.restaurant.urbanzestaurant.dto.LoginRequest;
import com.restaurant.urbanzestaurant.dto.RegisterRequest;
import com.restaurant.urbanzestaurant.entity.User;
import com.restaurant.urbanzestaurant.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // User Management Endpoints
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<User>> getAllActiveUsers() {
        return ResponseEntity.ok(authService.getAllActiveUsers());
    }

    @GetMapping("/users/all")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<User>> getAllUsersIncludingDeleted() {
        return ResponseEntity.ok(authService.getAllUsersIncludingDeleted());
    }

    @DeleteMapping("/users/{userId}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long userId) {
        authService.softDeleteUser(userId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/users/{userId}/restore")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> restoreUser(@PathVariable Long userId) {
        authService.restoreUser(userId);
        return ResponseEntity.ok().build();
    }
}