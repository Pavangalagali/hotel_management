package com.restaurant.urbanzestaurant.entity;

import java.time.LocalDateTime;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
// Note: Feedback usually should NOT be soft deleted for business intelligence
public class Feedback {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(nullable = false)
    private int rating;

    @Column(length = 500)
    private String comment;

    @Column(nullable = false)
    private LocalDateTime submittedAt;
    
    // Optional: Add if you need to soft delete feedback
    // @Column(name = "deleted_at")
    // private LocalDateTime deletedAt;
}