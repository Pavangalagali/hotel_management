package com.restaurant.urbanzestaurant.dto;

import com.restaurant.urbanzestaurant.enums.Role;

import lombok.Data;

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private Role role; // Must be one of ADMIN, MANAGER, CASHIER
}