package com.restaurant.urbanzestaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.urbanzestaurant.dto.OrderResponse;
import com.restaurant.urbanzestaurant.dto.UpdateOrderItemsRequest;
import com.restaurant.urbanzestaurant.entity.OrderEntity;
import com.restaurant.urbanzestaurant.entity.OrderEntity.OrderStatus;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
	List<OrderEntity> findByOrderStatus(OrderStatus status);
}