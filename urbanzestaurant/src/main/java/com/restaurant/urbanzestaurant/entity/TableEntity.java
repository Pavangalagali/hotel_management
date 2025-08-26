package com.restaurant.urbanzestaurant.entity;


import java.time.LocalDateTime;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tables")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE tables SET deleted_at = NOW() WHERE table_id = ?")
@Where(clause = "deleted_at IS NULL")
public class TableEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tableId;

    @Column(nullable = false, unique = true)
    private Integer tableNumber;

    @Column(nullable = false)
    private Integer capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TableStatus status;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public enum TableStatus {
        OCCUPIED, FREE
    }
}