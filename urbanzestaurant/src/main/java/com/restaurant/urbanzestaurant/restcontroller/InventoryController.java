package com.restaurant.urbanzestaurant.restcontroller;


import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.dto.InventoryRequest;
import com.restaurant.urbanzestaurant.dto.InventoryResponse;
import com.restaurant.urbanzestaurant.dto.InventoryUpdateRequest;
import com.restaurant.urbanzestaurant.service.InventoryService;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

	@Autowired
    private  InventoryService service;

    @PostMapping
    public ResponseEntity<InventoryResponse> addItem(@RequestBody InventoryRequest request) {
        return ResponseEntity.ok(service.addItem(request));
    }

    @GetMapping
    public ResponseEntity<List<InventoryResponse>> getAll() {
        return ResponseEntity.ok(service.getAll());
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryResponse>> getLowStockItems() {
        return ResponseEntity.ok(service.getLowStockItems());
    }

    @PutMapping("/{id}/quantity/{action}")
    public ResponseEntity<InventoryResponse> updateQuantity(@PathVariable Long id,
    														@PathVariable String action,
                                                            @RequestBody InventoryUpdateRequest request) {
        return ResponseEntity.ok(service.updateQuantity(id, request,action));
    }
}
