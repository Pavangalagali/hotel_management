package com.restaurant.urbanzestaurant.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class MenuItemResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private String category;
    private boolean available;
}
