package com.restaurant.urbanzestaurant.restcontroller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.dto.AuthResponse;
import com.restaurant.urbanzestaurant.dto.LoginRequest;
import com.restaurant.urbanzestaurant.dto.RegisterRequest;
import com.restaurant.urbanzestaurant.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	@Autowired
    private  AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
