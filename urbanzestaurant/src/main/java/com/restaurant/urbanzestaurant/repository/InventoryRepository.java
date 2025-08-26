package com.restaurant.urbanzestaurant.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.restaurant.urbanzestaurant.entity.InventoryItem;

public interface InventoryRepository extends JpaRepository<InventoryItem, Long> {
    
    // This will automatically exclude deleted due to @Where annotation
    List<InventoryItem> findByQuantityLessThanEqual(BigDecimal threshold);
    
    // Active items only
    @Query("SELECT i FROM InventoryItem i WHERE i.deletedAt IS NULL")
    List<InventoryItem> findAllActive();
    
    @Query("SELECT i FROM InventoryItem i WHERE i.quantity <= i.threshold AND i.deletedAt IS NULL")
    List<InventoryItem> findActiveLowStockItems();
    
    @Query("SELECT i FROM InventoryItem i WHERE i.name = :name AND i.deletedAt IS NULL")
    Optional<InventoryItem> findActiveByName(@Param("name") String name);
    
    // Include deleted
    @Query("SELECT i FROM InventoryItem i")
    List<InventoryItem> findAllIncludingDeleted();
    
    @Query("SELECT i FROM InventoryItem i WHERE i.deletedAt IS NOT NULL")
    List<InventoryItem> findAllDeleted();
}