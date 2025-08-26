package com.restaurant.urbanzestaurant.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.dto.MenuItemRequest;
import com.restaurant.urbanzestaurant.dto.MenuItemResponse;
import com.restaurant.urbanzestaurant.entity.MenuCategory;
import com.restaurant.urbanzestaurant.service.MenuService;

@RestController
@RequestMapping("/api/menu")
public class MenuRestController {

    @Autowired
    private MenuService menuService;

    // Category Endpoints
    @PostMapping("/categories")
    public ResponseEntity<Void> addCategory(@RequestParam String name) {
        menuService.addCategory(name);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/categories/all")
    public ResponseEntity<List<MenuCategory>> getAllCategories() {
        return ResponseEntity.ok(menuService.getAllCategories());
    }

    @GetMapping("/categories/all/including-deleted")
    public ResponseEntity<List<MenuCategory>> getAllCategoriesIncludingDeleted() {
        return ResponseEntity.ok(menuService.getAllCategoriesIncludingDeleted());
    }

    @DeleteMapping("/categories/{categoryId}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long categoryId) {
        menuService.softDeleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/categories/{categoryId}/restore")
    public ResponseEntity<Void> restoreCategory(@PathVariable Long categoryId) {
        menuService.restoreCategory(categoryId);
        return ResponseEntity.ok().build();
    }

    // Menu Item Endpoints
    @PostMapping
    public ResponseEntity<MenuItemResponse> addItem(@RequestBody MenuItemRequest request) {
        return new ResponseEntity<>(menuService.addMenuItem(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemResponse> updateItem(@PathVariable Long id, @RequestBody MenuItemRequest request) {
        return ResponseEntity.ok(menuService.updateMenuItem(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        menuService.softDeleteMenuItem(id); // Soft delete by default
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteItem(@PathVariable Long id) {
        try {
            menuService.hardDeleteMenuItem(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}/restore")
    public ResponseEntity<Void> restoreItem(@PathVariable Long id) {
        menuService.restoreMenuItem(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getAllItems() {
        return ResponseEntity.ok(menuService.getAllMenuItems());
    }

    @GetMapping("/all/including-deleted")
    public ResponseEntity<List<MenuItemResponse>> getAllItemsIncludingDeleted() {
        return ResponseEntity.ok(menuService.getAllMenuItemsIncludingDeleted());
    }

    @GetMapping("/deleted")
    public ResponseEntity<List<MenuItemResponse>> getDeletedItems() {
        return ResponseEntity.ok(menuService.getDeletedMenuItems());
    }

    @GetMapping("/available/{status}")
    public ResponseEntity<List<MenuItemResponse>> byAvailability(@PathVariable boolean status) {
        return ResponseEntity.ok(menuService.getByAvailability(status));
    }

    @GetMapping("/category/{id}")
    public ResponseEntity<List<MenuItemResponse>> byCategory(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.getByCategory(id));
    }
}
