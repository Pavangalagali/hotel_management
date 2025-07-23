package com.restaurant.urbanzestaurant.dto;


import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class OrderResponse {
    private Long orderId;
    private String customerName;
    private String orderType;
    private String orderStatus;
    private Integer tableNumber;
    private LocalDateTime createdAt;
    private List<OrderItemDetail> items;

    @Data
    public static class OrderItemDetail {
        private String itemName;
        private int quantity;
        private double price;
    }
}