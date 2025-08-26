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
@Table(name = "menu")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE menu SET deleted_at = NOW() WHERE menu_item_id = ?")
@Where(clause = "deleted_at IS NULL")
public class MenuItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long menuItemId;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private BigDecimal price;

    @ManyToOne
    @JoinColumn(name = "category_id", nullable = false)
    private MenuCategory category;

    @Column(nullable = false)
    private boolean available;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}