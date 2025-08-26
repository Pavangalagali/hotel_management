package com.restaurant.urbanzestaurant.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "bills")
@Data
@NoArgsConstructor
@AllArgsConstructor
// Note: Bills usually should NOT be soft deleted for compliance/audit reasons
public class Bill {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long billId;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(nullable = false)
    private BigDecimal subtotal;

    @Column(nullable = false)
    private BigDecimal tax;

    @Column(nullable = false)
    private BigDecimal total;

    @Column(nullable = false)
    private String paymentMethod;

    @Column(nullable = false)
    private String paymentStatus;

    @Column(nullable = false)
    private LocalDateTime paidAt;
    
    // Optional: Add if you really need to soft delete bills
    // @Column(name = "deleted_at")
    // private LocalDateTime deletedAt;
}