package com.restaurant.urbanzestaurant.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.InventoryRequest;
import com.restaurant.urbanzestaurant.dto.InventoryResponse;
import com.restaurant.urbanzestaurant.dto.InventoryUpdateRequest;
import com.restaurant.urbanzestaurant.entity.InventoryItem;
import com.restaurant.urbanzestaurant.repository.InventoryRepository;

import jakarta.transaction.Transactional;

@Service
public class InventoryService {

    @Autowired
    private InventoryRepository repo;

    public InventoryResponse addItem(InventoryRequest request) {
        InventoryItem item = new InventoryItem();
        item.setName(request.getName());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        item.setThreshold(request.getThreshold());
        return toResponse(repo.save(item));
    }

    public List<InventoryResponse> getAll() {
        return repo.findAllActive().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getAllIncludingDeleted() {
        return repo.findAllIncludingDeleted().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getDeletedItems() {
        return repo.findAllDeleted().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getLowStockItems() {
        return repo.findActiveLowStockItems().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public InventoryResponse updateQuantity(Long id, InventoryUpdateRequest request, String action) {
        InventoryItem item = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        BigDecimal newQuantity;
        if (action.equalsIgnoreCase("add")) {
            newQuantity = item.getQuantity().add(request.getQuantityChange());
        } else {
            newQuantity = item.getQuantity().subtract(request.getQuantityChange());
        }
        item.setQuantity(newQuantity.max(BigDecimal.ZERO));
        return toResponse(repo.save(item));
    }

    @Transactional
    public void softDeleteItem(Long id) {
        InventoryItem item = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        item.setDeletedAt(LocalDateTime.now());
        repo.save(item);
    }

    @Transactional
    public void restoreItem(Long id) {
        InventoryItem item = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));
        item.setDeletedAt(null);
        repo.save(item);
    }

    private InventoryResponse toResponse(InventoryItem item) {
        InventoryResponse res = new InventoryResponse();
        res.setId(item.getId());
        res.setName(item.getName());
        res.setQuantity(item.getQuantity());
        res.setUnit(item.getUnit());
        res.setThreshold(item.getThreshold());
        return res;
    }
}
