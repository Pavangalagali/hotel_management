package com.restaurant.urbanzestaurant.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurant.urbanzestaurant.entity.MenuItem;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByAvailable(boolean available);
    List<MenuItem> findByCategory_CategoryId(Long categoryId);
}

