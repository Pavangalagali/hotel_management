package com.restaurant.urbanzestaurant.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.entity.OrderEntity;
import com.restaurant.urbanzestaurant.entity.OrderEntity.OrderStatus;
import com.restaurant.urbanzestaurant.repository.OrderRepository;

@Service

public class KdsService {
	@Autowired
    private  OrderRepository orderRepo;

	

	    public List<OrderEntity> getPendingOrders() {
	        return orderRepo.findByOrderStatus(OrderStatus.PENDING);
	    }

	    public OrderEntity updateOrderStatus(Long orderId, OrderStatus newStatus) {
	        OrderEntity order = orderRepo.findById(orderId)
	                .orElseThrow(() -> new RuntimeException("Order not found"));

	        order.setOrderStatus(newStatus);
	        return orderRepo.save(order);
	    }
	
}
