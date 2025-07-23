package com.restaurant.urbanzestaurant.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.restaurant.urbanzestaurant.entity.TableEntity;


public interface TableRepository extends JpaRepository<TableEntity, Long> {
    Optional<TableEntity> findByTableNumber(Integer tableNumber);
    List<TableEntity> findByStatus(TableEntity.TableStatus status);
    boolean existsByTableNumber(Integer tableNumber);
    void deleteByTableNumber(Integer tableNumber);
}