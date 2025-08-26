package com.restaurant.urbanzestaurant.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.MenuItemRequest;
import com.restaurant.urbanzestaurant.dto.MenuItemResponse;
import com.restaurant.urbanzestaurant.entity.MenuCategory;
import com.restaurant.urbanzestaurant.entity.MenuItem;
import com.restaurant.urbanzestaurant.repository.MenuCategoryRepository;
import com.restaurant.urbanzestaurant.repository.MenuItemRepository;
import com.restaurant.urbanzestaurant.repository.OrderItemRepository;

import jakarta.transaction.Transactional;

@Service
public class MenuService {

    @Autowired
    private MenuItemRepository menuItemRepo;
    @Autowired
    private MenuCategoryRepository menuCategoryRepo;
    @Autowired
    private OrderItemRepository orderItemRepo;
    
    // Category methods
    public List<MenuCategory> getAllCategories() {
        return menuCategoryRepo.findAllActive(); // Only active categories
    }
    
    public List<MenuCategory> getAllCategoriesIncludingDeleted() {
        return menuCategoryRepo.findAllIncludingDeleted();
    }
    
    @Transactional
    public void addCategory(String name) {
        if (menuCategoryRepo.findActiveByCategoryName(name).isPresent()) {
            throw new RuntimeException("Category already exists.");
        }
        MenuCategory category = new MenuCategory();
        category.setCategoryName(name);
        menuCategoryRepo.save(category);
    }

    @Transactional
    public void softDeleteCategory(Long categoryId) {
        MenuCategory category = menuCategoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        
        // Check if category has active menu items
        List<MenuItem> activeItems = menuItemRepo.findByCategory_CategoryId(categoryId);
        if (!activeItems.isEmpty()) {
            throw new RuntimeException("Cannot delete category. It has active menu items. Delete menu items first.");
        }
        
        category.setDeletedAt(LocalDateTime.now());
        menuCategoryRepo.save(category);
    }

    @Transactional
    public void restoreCategory(Long categoryId) {
        MenuCategory category = menuCategoryRepo.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setDeletedAt(null);
        menuCategoryRepo.save(category);
    }

    // Menu item methods
    public MenuItemResponse addMenuItem(MenuItemRequest req) {
        MenuCategory cat = getActiveCategory(req.getCategoryId());
        MenuItem item = new MenuItem();
        item.setName(req.getName());
        item.setPrice(req.getPrice());
        item.setAvailable(req.isAvailable());
        item.setCategory(cat);
        return toDto(menuItemRepo.save(item));
    }

    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest req) {
        MenuItem item = menuItemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Item not found"));
        MenuCategory cat = getActiveCategory(req.getCategoryId());
        item.setName(req.getName());
        item.setPrice(req.getPrice());
        item.setAvailable(req.isAvailable());
        item.setCategory(cat);
        return toDto(menuItemRepo.save(item));
    }

    @Transactional
    public void softDeleteMenuItem(Long id) {
        MenuItem item = menuItemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setDeletedAt(LocalDateTime.now());
        menuItemRepo.save(item);
    }

    @Transactional
    public void hardDeleteMenuItem(Long id) {
        MenuItem item = menuItemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        
        // Check if it's safe to delete
        boolean hasOrderReferences = orderItemRepo.existsByMenuItem_MenuItemId(id);
        if (hasOrderReferences) {
            throw new RuntimeException("Cannot delete menu item. It has order references. Use soft delete instead.");
        }
        
        menuItemRepo.delete(item);
    }

    @Transactional
    public void restoreMenuItem(Long id) {
        MenuItem item = menuItemRepo.findByIdIncludingDeleted(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setDeletedAt(null);
        menuItemRepo.save(item);
    }

    public List<MenuItemResponse> getAllMenuItems() {
        return menuItemRepo.findAllActive().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getAllMenuItemsIncludingDeleted() {
        return menuItemRepo.findAllIncludingDeleted().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getDeletedMenuItems() {
        return menuItemRepo.findAllDeleted().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getByAvailability(boolean available) {
        return menuItemRepo.findActiveByAvailable(available).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<MenuItemResponse> getByCategory(Long categoryId) {
        return menuItemRepo.findByCategory_CategoryId(categoryId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private MenuCategory getActiveCategory(Long id) {
        return menuCategoryRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found or deleted"));
    }

    private MenuItemResponse toDto(MenuItem item) {
        MenuItemResponse dto = new MenuItemResponse();
        dto.setId(item.getMenuItemId());
        dto.setName(item.getName());
        dto.setPrice(item.getPrice());
        dto.setAvailable(item.isAvailable());
        dto.setCategory(item.getCategory().getCategoryName());
        return dto;
    }
}
