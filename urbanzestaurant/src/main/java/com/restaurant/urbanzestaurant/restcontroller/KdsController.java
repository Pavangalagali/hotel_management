package com.restaurant.urbanzestaurant.restcontroller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.entity.OrderEntity;
import com.restaurant.urbanzestaurant.entity.OrderEntity.OrderStatus;
import com.restaurant.urbanzestaurant.service.KdsService;

@RestController
@RequestMapping("/api/kds")
public class KdsController {

    @Autowired
    private KdsService kdsService;

    @GetMapping("/pending")
    public ResponseEntity<List<OrderEntity>> getPendingOrders() {
        return ResponseEntity.ok(kdsService.getPendingOrders());
    }

    @PutMapping("/update-status/{orderId}")
    public ResponseEntity<OrderEntity> updateOrderStatus(@PathVariable Long orderId,
                                                         @RequestParam OrderStatus status) {
        return ResponseEntity.ok(kdsService.updateOrderStatus(orderId, status));
    }
}
