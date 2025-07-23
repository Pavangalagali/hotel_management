package com.restaurant.urbanzestaurant.dto;

import lombok.Data;

@Data
public class BillRequest {
    private Long orderId;
    private String paymentMethod; // CASH, CARD, UPI
    private double taxPercent;    // e.g. 10.0 for 10%
}