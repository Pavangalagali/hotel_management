package com.restaurant.urbanzestaurant.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.restaurant.urbanzestaurant.entity.MenuItem;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    // These will automatically exclude deleted due to @Where annotation
    List<MenuItem> findByAvailable(boolean available);
    List<MenuItem> findByCategory_CategoryId(Long categoryId);
    
    // Explicit active queries
    @Query("SELECT m FROM MenuItem m WHERE m.deletedAt IS NULL")
    List<MenuItem> findAllActive();
    
    @Query("SELECT m FROM MenuItem m WHERE m.available = :available AND m.deletedAt IS NULL")
    List<MenuItem> findActiveByAvailable(@Param("available") boolean available);
    
    // Include deleted queries
    @Query("SELECT m FROM MenuItem m")
    List<MenuItem> findAllIncludingDeleted();
    
    @Query("SELECT m FROM MenuItem m WHERE m.menuItemId = :id")
    Optional<MenuItem> findByIdIncludingDeleted(@Param("id") Long id);
    
    @Query("SELECT m FROM MenuItem m WHERE m.deletedAt IS NOT NULL")
    List<MenuItem> findAllDeleted();
}
