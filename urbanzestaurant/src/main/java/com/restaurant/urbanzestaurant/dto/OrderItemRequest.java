package com.restaurant.urbanzestaurant.dto;

import lombok.Data;

@Data
public class OrderItemRequest {
    private Long menuItemId;
    private int quantity;
}
