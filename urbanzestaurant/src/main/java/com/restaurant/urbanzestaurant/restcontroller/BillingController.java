package com.restaurant.urbanzestaurant.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.dto.BillRequest;
import com.restaurant.urbanzestaurant.dto.BillResponse;
import com.restaurant.urbanzestaurant.service.BillingService;

@RestController
@RequestMapping("/api/billing")
public class BillingController {

    @Autowired
    private BillingService billingService;

    @PostMapping("/generate")
    public ResponseEntity<BillResponse> generateBill(@RequestBody BillRequest request) {
        return new ResponseEntity<>(billingService.generateBill(request), HttpStatus.CREATED);
    }

    @GetMapping("/all")
    public ResponseEntity<List<BillResponse>> getAllBills() {
        List<BillResponse> bills = billingService.getAllBills();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/active-orders")
    public ResponseEntity<List<BillResponse>> getBillsForActiveOrders() {
        List<BillResponse> bills = billingService.getBillsForActiveOrders();
        return ResponseEntity.ok(bills);
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<BillResponse>> getBillsByOrder(@PathVariable Long orderId) {
        List<BillResponse> bills = billingService.getBillsByOrderId(orderId);
        return ResponseEntity.ok(bills);
    }
}