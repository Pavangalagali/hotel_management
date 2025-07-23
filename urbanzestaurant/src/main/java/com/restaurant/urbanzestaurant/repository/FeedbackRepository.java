package com.restaurant.urbanzestaurant.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.urbanzestaurant.entity.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    Optional<Feedback> findByOrder_OrderId(Long orderId);
    List<Feedback> findAll();
}

