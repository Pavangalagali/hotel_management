package com.restaurant.urbanzestaurant.entity;

import java.time.LocalDateTime;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.Where;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "menu_categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
@SQLDelete(sql = "UPDATE menu_categories SET deleted_at = NOW() WHERE category_id = ?")
@Where(clause = "deleted_at IS NULL")
public class MenuCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @Column(unique = true, nullable = false)
    private String categoryName;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
}