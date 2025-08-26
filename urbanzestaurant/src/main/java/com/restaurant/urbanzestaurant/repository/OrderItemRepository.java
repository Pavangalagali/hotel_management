package com.restaurant.urbanzestaurant.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.restaurant.urbanzestaurant.entity.OrderItemEntity;

public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {
    List<OrderItemEntity> findByOrder_OrderId(Long orderId);
    void deleteByOrder_OrderId(Long orderId);
    
    // Active order items only
    @Query("SELECT oi FROM OrderItemEntity oi WHERE oi.order.orderId = :orderId AND oi.deletedAt IS NULL")
    List<OrderItemEntity> findActiveByOrder_OrderId(@Param("orderId") Long orderId);
    
    // Check references
    @Query("SELECT COUNT(oi) > 0 FROM OrderItemEntity oi WHERE oi.menuItem.menuItemId = :menuItemId AND oi.deletedAt IS NULL")
    boolean existsActiveByMenuItem_MenuItemId(@Param("menuItemId") Long menuItemId);
    
    @Query("SELECT COUNT(oi) > 0 FROM OrderItemEntity oi WHERE oi.menuItem.menuItemId = :menuItemId")
    boolean existsByMenuItem_MenuItemId(@Param("menuItemId") Long menuItemId);
    
    // Include deleted
    @Query("SELECT oi FROM OrderItemEntity oi WHERE oi.order.orderId = :orderId")
    List<OrderItemEntity> findAllByOrder_OrderIdIncludingDeleted(@Param("orderId") Long orderId);
}