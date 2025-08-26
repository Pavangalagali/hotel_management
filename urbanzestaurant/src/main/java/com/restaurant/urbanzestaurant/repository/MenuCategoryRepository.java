package com.restaurant.urbanzestaurant.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.restaurant.urbanzestaurant.entity.MenuCategory;

@Repository
public interface MenuCategoryRepository extends JpaRepository<MenuCategory, Long> {
    Optional<MenuCategory> findByCategoryName(String name);
    
    @Query("SELECT c FROM MenuCategory c WHERE c.deletedAt IS NULL")
    List<MenuCategory> findAllActive();
    
    @Query("SELECT c FROM MenuCategory c WHERE c.categoryName = :name AND c.deletedAt IS NULL")
    Optional<MenuCategory> findActiveByCategoryName(@Param("name") String name);
    
    @Query("SELECT c FROM MenuCategory c")
    List<MenuCategory> findAllIncludingDeleted();
}
