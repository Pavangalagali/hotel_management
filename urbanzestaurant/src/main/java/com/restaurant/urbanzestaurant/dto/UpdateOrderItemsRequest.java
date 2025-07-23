package com.restaurant.urbanzestaurant.dto;

import java.util.List;
import lombok.Data;

@Data
public class UpdateOrderItemsRequest {
    private List<OrderItemRequest> items; // Complete updated list of items
}
