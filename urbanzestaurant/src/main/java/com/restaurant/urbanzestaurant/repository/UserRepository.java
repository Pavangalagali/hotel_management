package com.restaurant.urbanzestaurant.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.restaurant.urbanzestaurant.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    
    // Active users only
    @Query("SELECT u FROM User u WHERE u.deletedAt IS NULL")
    List<User> findAllActive();
    
    @Query("SELECT u FROM User u WHERE u.username = :username AND u.deletedAt IS NULL")
    Optional<User> findActiveByUsername(@Param("username") String username);
    
    // Include deleted
    @Query("SELECT u FROM User u")
    List<User> findAllIncludingDeleted();
}