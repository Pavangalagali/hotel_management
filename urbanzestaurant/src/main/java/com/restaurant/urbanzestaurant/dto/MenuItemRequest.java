package com.restaurant.urbanzestaurant.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class MenuItemRequest {
    private String name;
    private BigDecimal price;
    private Long categoryId;
    private boolean available;
}

