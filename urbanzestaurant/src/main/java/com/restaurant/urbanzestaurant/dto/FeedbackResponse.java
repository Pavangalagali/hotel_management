package com.restaurant.urbanzestaurant.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FeedbackResponse {
    private Long id;
    private Long orderId;
    private int rating;
    private String comment;
    private LocalDateTime submittedAt;
}