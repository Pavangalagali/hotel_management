package com.restaurant.urbanzestaurant.dto;

import java.util.List;

import lombok.Data;

@Data
public class OrderRequest {
    private String customerName;
    private String orderType; // DINEIN, TAKEOUT, DELIVERY
    private Long tableId;     // Nullable if not dine-in
    private List<OrderItemRequest> items;
}
