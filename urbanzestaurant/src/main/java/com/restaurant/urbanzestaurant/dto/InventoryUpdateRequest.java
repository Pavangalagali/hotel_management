package com.restaurant.urbanzestaurant.dto;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class InventoryUpdateRequest {
    private BigDecimal quantityChange; // +ve to add, -ve to reduce
}
