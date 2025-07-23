package com.restaurant.urbanzestaurant.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.restaurant.urbanzestaurant.entity.Bill;

public interface BillRepository extends JpaRepository<Bill, Long> {
    boolean existsByOrder_OrderId(Long orderId);
    List<Bill> findByOrder_OrderId(Long orderId);
    List<Bill> findByPaidAtBetween(LocalDateTime start, LocalDateTime end);

}