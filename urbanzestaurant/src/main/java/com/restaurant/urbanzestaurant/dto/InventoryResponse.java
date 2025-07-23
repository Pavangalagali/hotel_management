package com.restaurant.urbanzestaurant.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class InventoryResponse {
    private Long id;
    private String name;
    private BigDecimal quantity;
    private String unit;
    private BigDecimal threshold;
}