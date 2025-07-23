package com.restaurant.urbanzestaurant.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.BillRequest;
import com.restaurant.urbanzestaurant.dto.BillResponse;
import com.restaurant.urbanzestaurant.dto.BillResponse.ItemBreakdown;
import com.restaurant.urbanzestaurant.entity.Bill;
import com.restaurant.urbanzestaurant.entity.OrderEntity;
import com.restaurant.urbanzestaurant.entity.OrderItemEntity;
import com.restaurant.urbanzestaurant.repository.BillRepository;
import com.restaurant.urbanzestaurant.repository.OrderItemRepository;
import com.restaurant.urbanzestaurant.repository.OrderRepository;

@Service
public class BillingService {

	@Autowired
    private  OrderRepository orderRepo;
	@Autowired
    private  OrderItemRepository itemRepo;
	@Autowired
    private  BillRepository billRepo;

    public BillResponse generateBill(BillRequest request) {
        if (billRepo.existsByOrder_OrderId(request.getOrderId())) {
            throw new RuntimeException("Bill already generated for this order.");
        }

        OrderEntity order = orderRepo.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found."));

        List<OrderItemEntity> items = itemRepo.findByOrder_OrderId(order.getOrderId());

        BigDecimal subtotal = items.stream()
                .map(i -> i.getMenuItem().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = subtotal.multiply(BigDecimal.valueOf(request.getTaxPercent() / 100.0));
        BigDecimal total = subtotal.add(tax);

        Bill bill = new Bill();
        bill.setOrder(order);
        bill.setSubtotal(subtotal);
        bill.setTax(tax);
        bill.setTotal(total);
        bill.setPaymentMethod(request.getPaymentMethod());
        bill.setPaymentStatus("PAID");
        bill.setPaidAt(LocalDateTime.now());

        bill = billRepo.save(bill);

        // Map to response
        BillResponse res = new BillResponse();
        res.setBillId(bill.getBillId());
        res.setOrderId(order.getOrderId());
        res.setSubtotal(bill.getSubtotal());
        res.setTax(bill.getTax());
        res.setTotal(bill.getTotal());
        res.setPaymentMethod(bill.getPaymentMethod());
        res.setPaymentStatus(bill.getPaymentStatus());
        res.setPaidAt(bill.getPaidAt());

        res.setItems(items.stream().map(i -> {
            ItemBreakdown d = new ItemBreakdown();
            d.setItem(i.getMenuItem().getName());
            d.setQuantity(i.getQuantity());
            d.setUnitPrice(i.getMenuItem().getPrice());
            d.setTotal(i.getMenuItem().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())));
            return d;
        }).collect(Collectors.toList()));

        return res;
    }
    
    public List<BillResponse> getAllBills() {
        return billRepo.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<BillResponse> getBillsByOrderId(Long orderId) {
        return billRepo.findByOrder_OrderId(orderId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private BillResponse mapToDto(Bill bill) {
        OrderEntity order = bill.getOrder();
        List<OrderItemEntity> items = itemRepo.findByOrder_OrderId(order.getOrderId());

        BillResponse response = new BillResponse();
        response.setBillId(bill.getBillId());
        response.setOrderId(order.getOrderId());
        response.setSubtotal(bill.getSubtotal());
        response.setTax(bill.getTax());
        response.setTotal(bill.getTotal());
        response.setPaymentMethod(bill.getPaymentMethod());
        response.setPaymentStatus(bill.getPaymentStatus());
        response.setPaidAt(bill.getPaidAt());

        response.setItems(items.stream().map(i -> {
            ItemBreakdown d = new ItemBreakdown();
            d.setItem(i.getMenuItem().getName());
            d.setQuantity(i.getQuantity());
            d.setUnitPrice(i.getMenuItem().getPrice());
            d.setTotal(i.getMenuItem().getPrice().multiply(BigDecimal.valueOf(i.getQuantity())));
            return d;
        }).collect(Collectors.toList()));

        return response;
    }
}