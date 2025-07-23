package com.restaurant.urbanzestaurant.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

import lombok.Data;

@Data
public class SalesReportDTO {
    private LocalDate date;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal totalTax;
}
