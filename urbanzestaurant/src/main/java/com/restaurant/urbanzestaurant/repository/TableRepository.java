package com.restaurant.urbanzestaurant.repository;


import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.restaurant.urbanzestaurant.entity.TableEntity;

public interface TableRepository extends JpaRepository<TableEntity, Long> {
    Optional<TableEntity> findByTableNumber(Integer tableNumber);
    List<TableEntity> findByStatus(TableEntity.TableStatus status);
    boolean existsByTableNumber(Integer tableNumber);
    
    // Active tables only
    @Query("SELECT t FROM TableEntity t WHERE t.deletedAt IS NULL")
    List<TableEntity> findAllActive();
    
    @Query("SELECT t FROM TableEntity t WHERE t.tableNumber = :tableNumber AND t.deletedAt IS NULL")
    Optional<TableEntity> findActiveByTableNumber(@Param("tableNumber") Integer tableNumber);
    
    @Query("SELECT t FROM TableEntity t WHERE t.status = :status AND t.deletedAt IS NULL")
    List<TableEntity> findActiveByStatus(@Param("status") TableEntity.TableStatus status);
    
    @Query("SELECT COUNT(t) > 0 FROM TableEntity t WHERE t.tableNumber = :tableNumber AND t.deletedAt IS NULL")
    boolean existsActiveByTableNumber(@Param("tableNumber") Integer tableNumber);
    
    // Include deleted
    @Query("SELECT t FROM TableEntity t")
    List<TableEntity> findAllIncludingDeleted();
}