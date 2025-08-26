package com.restaurant.urbanzestaurant.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE orders SET deleted_at = NOW() WHERE order_id = ?")
@Where(clause = "deleted_at IS NULL")
public class OrderEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long orderId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType orderType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus orderStatus;

    @Column
    private String customerName;

    @ManyToOne
    @JoinColumn(name = "table_id")
    private TableEntity table;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum OrderType {
        DINEIN, TAKEOUT, DELIVERY
    }

    public enum OrderStatus {
        PENDING, PREPARING, SERVED, CANCELLED
    }
}

