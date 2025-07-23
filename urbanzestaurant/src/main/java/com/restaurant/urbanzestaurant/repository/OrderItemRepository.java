package com.restaurant.urbanzestaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.urbanzestaurant.entity.OrderItemEntity;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrder_OrderId(Long orderId);
    void deleteByOrder_OrderId(Long orderId);

}