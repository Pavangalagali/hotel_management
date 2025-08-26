package com.restaurant.urbanzestaurant.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.OrderItemRequest;
import com.restaurant.urbanzestaurant.dto.OrderRequest;
import com.restaurant.urbanzestaurant.dto.OrderResponse;
import com.restaurant.urbanzestaurant.entity.MenuItem;
import com.restaurant.urbanzestaurant.entity.OrderEntity;
import com.restaurant.urbanzestaurant.entity.OrderItemEntity;
import com.restaurant.urbanzestaurant.entity.TableEntity;
import com.restaurant.urbanzestaurant.repository.MenuItemRepository;
import com.restaurant.urbanzestaurant.repository.OrderItemRepository;
import com.restaurant.urbanzestaurant.repository.OrderRepository;
import com.restaurant.urbanzestaurant.repository.TableRepository;

import jakarta.transaction.Transactional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepo;
    @Autowired
    private OrderItemRepository itemRepo;
    @Autowired
    private TableRepository tableRepo;
    @Autowired
    private MenuItemRepository menuRepo;

    public OrderResponse placeOrder(OrderRequest request) {
        OrderEntity order = new OrderEntity();
        order.setCustomerName(request.getCustomerName());
        order.setOrderType(OrderEntity.OrderType.valueOf(request.getOrderType().toUpperCase()));
        order.setOrderStatus(OrderEntity.OrderStatus.PENDING);

        if (request.getTableId() != null) {
            TableEntity table = tableRepo.findById(request.getTableId())
                    .orElseThrow(() -> new RuntimeException("Table not found"));
            order.setTable(table);
        }

        order = orderRepo.save(order);

        for (OrderItemRequest itemReq : request.getItems()) {
            MenuItem menuItem = menuRepo.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));

            OrderItemEntity item = new OrderItemEntity();
            item.setOrder(order);
            item.setMenuItem(menuItem);
            item.setQuantity(itemReq.getQuantity());

            itemRepo.save(item);
        }

        return getOrderDetails(order.getOrderId());
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAllActive()
                .stream()
                .map(order -> getOrderDetails(order.getOrderId()))
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getAllOrdersIncludingDeleted() {
        return orderRepo.findAllIncludingDeleted()
                .stream()
                .map(order -> getOrderDetailsIncludingDeleted(order.getOrderId()))
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderDetails(Long id) {
        OrderEntity order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderItemEntity> items = itemRepo.findActiveByOrder_OrderId(order.getOrderId());
        return mapToOrderResponse(order, items);
    }

    public OrderResponse getOrderDetailsIncludingDeleted(Long id) {
        OrderEntity order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        List<OrderItemEntity> items = itemRepo.findAllByOrder_OrderIdIncludingDeleted(order.getOrderId());
        return mapToOrderResponse(order, items);
    }

    public OrderResponse updateStatus(Long orderId, String status) {
        OrderEntity order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setOrderStatus(OrderEntity.OrderStatus.valueOf(status.toUpperCase()));
        return getOrderDetails(orderRepo.save(order).getOrderId());
    }

    @Transactional
    public OrderResponse updateOrder(Long orderId, OrderRequest request) {
        OrderEntity order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Update order fields
        order.setCustomerName(request.getCustomerName());
        order.setOrderType(OrderEntity.OrderType.valueOf(String.valueOf(request.getOrderType()).toUpperCase()));
        
        if (request.getTableId() != null) {
            TableEntity table = tableRepo.findById(request.getTableId())
                    .orElseThrow(() -> new RuntimeException("Table not found"));
            order.setTable(table);
        } else {
            order.setTable(null);
        }

        // Soft delete old order items
        List<OrderItemEntity> oldItems = itemRepo.findActiveByOrder_OrderId(orderId);
        for (OrderItemEntity oldItem : oldItems) {
            oldItem.setDeletedAt(LocalDateTime.now());
            itemRepo.save(oldItem);
        }

        // Add new items
        List<OrderItemEntity> newItems = request.getItems().stream().map(req -> {
            MenuItem item = menuRepo.findById(req.getMenuItemId())
                    .orElseThrow(() -> new RuntimeException("Menu item not found"));
            OrderItemEntity oi = new OrderItemEntity();
            oi.setOrder(order);
            oi.setMenuItem(item);
            oi.setQuantity(req.getQuantity());
            return oi;
        }).collect(Collectors.toList());

        orderRepo.save(order);
        itemRepo.saveAll(newItems);

        return mapToOrderResponse(order, newItems);
    }

    @Transactional
    public void softDeleteOrder(Long orderId) {
        OrderEntity order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setDeletedAt(LocalDateTime.now());
        orderRepo.save(order);

        // Also soft delete order items
        List<OrderItemEntity> items = itemRepo.findActiveByOrder_OrderId(orderId);
        for (OrderItemEntity item : items) {
            item.setDeletedAt(LocalDateTime.now());
            itemRepo.save(item);
        }
    }

    @Transactional
    public void restoreOrder(Long orderId) {
        OrderEntity order = orderRepo.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setDeletedAt(null);
        orderRepo.save(order);

        // Restore order items
        List<OrderItemEntity> items = itemRepo.findAllByOrder_OrderIdIncludingDeleted(orderId);
        for (OrderItemEntity item : items) {
            item.setDeletedAt(null);
            itemRepo.save(item);
        }
    }

    private OrderResponse mapToOrderResponse(OrderEntity order, List<OrderItemEntity> items) {
        OrderResponse response = new OrderResponse();
        response.setOrderId(order.getOrderId());
        response.setCustomerName(order.getCustomerName());
        response.setOrderType(order.getOrderType().name());
        response.setOrderStatus(order.getOrderStatus().name());
        response.setCreatedAt(order.getCreatedAt());

        if (order.getTable() != null) {
            response.setTableNumber(order.getTable().getTableNumber());
        }

        List<OrderResponse.OrderItemDetail> itemDetails = items.stream().map(item -> {
            OrderResponse.OrderItemDetail detail = new OrderResponse.OrderItemDetail();
            detail.setItemName(item.getMenuItem().getName());
            detail.setQuantity(item.getQuantity());
            detail.setPrice(item.getMenuItem().getPrice().doubleValue());
            return detail;
        }).collect(Collectors.toList());

        response.setItems(itemDetails);
        return response;
    }
}