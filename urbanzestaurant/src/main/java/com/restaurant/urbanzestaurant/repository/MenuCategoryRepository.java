package com.restaurant.urbanzestaurant.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurant.urbanzestaurant.entity.MenuCategory;

@Repository
	public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
	    Optional<MenuCategory> findByCategoryName(String name);
	}

