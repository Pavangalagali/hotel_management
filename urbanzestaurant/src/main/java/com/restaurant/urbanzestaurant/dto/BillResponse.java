package com.restaurant.urbanzestaurant.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class BillResponse {

    private Long billId;
    private Long orderId;
    private List<ItemBreakdown> items;
    private BigDecimal subtotal;
    private BigDecimal tax;
    private BigDecimal total;
    private String paymentMethod;
    private String paymentStatus;
    private LocalDateTime paidAt;

    @Data
    public static class ItemBreakdown {
        private String item;
        private int quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
    }
}