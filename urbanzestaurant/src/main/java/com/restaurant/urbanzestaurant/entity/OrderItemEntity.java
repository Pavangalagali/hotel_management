package com.restaurant.urbanzestaurant.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE order_items SET deleted_at = NOW() WHERE order_item_id = ?")
@Where(clause = "deleted_at IS NULL")
public class OrderItemEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderItemId;

    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private int quantity;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}