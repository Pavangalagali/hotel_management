package com.restaurant.urbanzestaurant.dto;

import lombok.Data;

@Data
public class FeedbackRequest {
    private Long orderId;
    private int rating;
    private String comment;
}
