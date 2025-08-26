package com.restaurant.urbanzestaurant.repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.restaurant.urbanzestaurant.entity.Bill;

public interface BillRepository extends JpaRepository<Bill, Long> {
    boolean existsByOrder_OrderId(Long orderId);
    List<Bill> findByOrder_OrderId(Long orderId);
    List<Bill> findByPaidAtBetween(LocalDateTime start, LocalDateTime end);
    
    // Only get bills for active orders
    @Query("SELECT b FROM Bill b WHERE b.order.deletedAt IS NULL")
    List<Bill> findAllForActiveOrders();
    
    @Query("SELECT b FROM Bill b WHERE b.order.orderId = :orderId AND b.order.deletedAt IS NULL")
    List<Bill> findByActiveOrder_OrderId(@Param("orderId") Long orderId);
    
    @Query("SELECT b FROM Bill b WHERE b.order.deletedAt IS NULL AND b.paidAt BETWEEN :start AND :end")
    List<Bill> findByPaidAtBetweenForActiveOrders(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}