package com.restaurant.urbanzestaurant.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.restaurant.urbanzestaurant.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByOrder_OrderId(Long orderId);
    List<Feedback> findAll();
    
    // Only get feedback for active orders
    @Query("SELECT f FROM Feedback f WHERE f.order.deletedAt IS NULL")
    List<Feedback> findAllForActiveOrders();
    
    @Query("SELECT f FROM Feedback f WHERE f.order.orderId = :orderId AND f.order.deletedAt IS NULL")
    Optional<Feedback> findByActiveOrder_OrderId(@Param("orderId") Long orderId);
}