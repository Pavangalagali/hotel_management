package com.restaurant.urbanzestaurant.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventory_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE inventory_items SET deleted_at = NOW() WHERE id = ?")
@Where(clause = "deleted_at IS NULL")
public class InventoryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private BigDecimal quantity;

    @Column(nullable = false)
    private String unit;

    @Column(nullable = false)
    private BigDecimal threshold;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}