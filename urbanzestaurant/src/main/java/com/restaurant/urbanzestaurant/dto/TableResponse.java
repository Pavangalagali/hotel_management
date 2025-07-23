package com.restaurant.urbanzestaurant.dto;

import lombok.Data;

@Data
public class TableResponse {
    private Long tableId;
    private Integer tableNumber;
    private Integer capacity;
    private String status;
}
