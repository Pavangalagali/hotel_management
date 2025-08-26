package com.restaurant.urbanzestaurant.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.restaurant.urbanzestaurant.entity.OrderEntity;
import com.restaurant.urbanzestaurant.entity.OrderEntity.OrderStatus;

public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findByOrderStatus(OrderStatus status);
    
    // Active orders only
    @Query("SELECT o FROM OrderEntity o WHERE o.deletedAt IS NULL")
    List<OrderEntity> findAllActive();
    
    @Query("SELECT o FROM OrderEntity o WHERE o.orderStatus = :status AND o.deletedAt IS NULL")
    List<OrderEntity> findActiveByOrderStatus(@Param("status") OrderStatus status);
    
    // Check references
    @Query("SELECT COUNT(o) > 0 FROM OrderEntity o WHERE o.table.tableId = :tableId AND o.deletedAt IS NULL")
    boolean existsActiveByTable_TableId(@Param("tableId") Long tableId);
    
    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.table.tableId = :tableId AND o.deletedAt IS NULL")
    long countActiveOrdersByTableId(@Param("tableId") Long tableId);
    
    // Include deleted
    @Query("SELECT o FROM OrderEntity o")
    List<OrderEntity> findAllIncludingDeleted();
}