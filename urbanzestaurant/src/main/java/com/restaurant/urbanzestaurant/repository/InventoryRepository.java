package com.restaurant.urbanzestaurant.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.urbanzestaurant.entity.InventoryItem;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {

    List<InventoryItem> findByQuantityLessThanEqual(BigDecimal threshold);
}