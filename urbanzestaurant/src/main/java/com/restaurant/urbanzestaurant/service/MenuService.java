package com.restaurant.urbanzestaurant.service;

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

@Service
public class MenuService {

	@Autowired
    private  MenuItemRepository menuItemRepo;
	@Autowired
    private  MenuCategoryRepository menuCategoryRepo;
	 
	public List<MenuCategory> getAllCategories() {
	        return menuCategoryRepo.findAll();
	    } 
	
	 public void addCategory(String name) {
	        if (menuCategoryRepo.findByCategoryName(name).isPresent()) {
	            throw new RuntimeException("Category already exists.");
	        }
	        MenuCategory category = new MenuCategory();
	        category.setCategoryName(name);
	        menuCategoryRepo.save(category);
	    }

	    public MenuItemResponse addMenuItem(MenuItemRequest req) {
	        MenuCategory cat = getCategory(req.getCategoryId());
	        MenuItem item = new MenuItem();
	        item.setName(req.getName());
	        item.setPrice(req.getPrice());
	        item.setAvailable(req.isAvailable());
	        item.setCategory(cat);
	        return toDto(menuItemRepo.save(item));
	    }

	    public MenuItemResponse updateMenuItem(Long id, MenuItemRequest req) {
	        MenuItem item = menuItemRepo.findById(id).orElseThrow(() -> new RuntimeException("Item not found"));
	        MenuCategory cat = getCategory(req.getCategoryId());
	        item.setName(req.getName());
	        item.setPrice(req.getPrice());
	        item.setAvailable(req.isAvailable());
	        item.setCategory(cat);
	        return toDto(menuItemRepo.save(item));
	    }

	    public void deleteMenuItem(Long id) {
	        menuItemRepo.deleteById(id);
	    }

	    public List<MenuItemResponse> getAllMenuItems() {
	        return menuItemRepo.findAll().stream().map(this::toDto).collect(Collectors.toList());
	    }

	    public List<MenuItemResponse> getByAvailability(boolean available) {
	        return menuItemRepo.findByAvailable(available).stream().map(this::toDto).collect(Collectors.toList());
	    }

	    public List<MenuItemResponse> getByCategory(Long categoryId) {
	        return menuItemRepo.findByCategory_CategoryId(categoryId).stream().map(this::toDto).collect(Collectors.toList());
	    }

	    private MenuCategory getCategory(Long id) {
	        return menuCategoryRepo.findById(id).orElseThrow(() -> new RuntimeException("Category not found"));
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
