package com.restaurant.urbanzestaurant.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.TableRequest;
import com.restaurant.urbanzestaurant.dto.TableResponse;
import com.restaurant.urbanzestaurant.entity.TableEntity;
import com.restaurant.urbanzestaurant.repository.OrderRepository;
import com.restaurant.urbanzestaurant.repository.TableRepository;

import jakarta.transaction.Transactional;

@Service
public class TableService {

    @Autowired
    private TableRepository tableRepository;
    @Autowired
    private OrderRepository orderRepository;

    public List<TableResponse> getAllTables() {
        return tableRepository.findAllActive().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<TableResponse> getAllTablesIncludingDeleted() {
        return tableRepository.findAllIncludingDeleted().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public TableResponse addTable(TableRequest request) {
        if (tableRepository.existsActiveByTableNumber(request.getTableNumber())) {
            throw new RuntimeException("Table already exists.");
        }

        TableEntity table = new TableEntity();
        table.setTableNumber(request.getTableNumber());
        table.setCapacity(request.getCapacity());
        table.setStatus(TableEntity.TableStatus.FREE);

        return toDto(tableRepository.save(table));
    }

    @Transactional
    public void softDeleteByTableNumber(Integer tableNumber) {
        TableEntity table = tableRepository.findActiveByTableNumber(tableNumber)
                .orElseThrow(() -> new RuntimeException("Table not found."));
        table.setDeletedAt(LocalDateTime.now());
        tableRepository.save(table);
    }

    @Transactional
    public void softDeleteTable(Long tableId) {
        TableEntity table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));
        table.setDeletedAt(LocalDateTime.now());
        tableRepository.save(table);
    }

    @Transactional
    public void hardDeleteTable(Long tableId) {
        if (!canHardDelete(tableId)) {
            throw new RuntimeException("Cannot delete table. It has order references.");
        }
        tableRepository.deleteById(tableId);
    }

    @Transactional
    public void restoreTable(Long tableId) {
        TableEntity table = tableRepository.findById(tableId)
                .orElseThrow(() -> new RuntimeException("Table not found"));
        table.setDeletedAt(null);
        tableRepository.save(table);
    }

    public boolean canHardDelete(Long tableId) {
        return !orderRepository.existsActiveByTable_TableId(tableId);
    }

    public TableResponse assignTable(Integer tableNumber, String status) {
        TableEntity table = tableRepository.findActiveByTableNumber(tableNumber)
                .orElseThrow(() -> new RuntimeException("Table not found."));
        
        if (status.equalsIgnoreCase("free")) {
            table.setStatus(TableEntity.TableStatus.FREE);
        } else {
            table.setStatus(TableEntity.TableStatus.OCCUPIED);
        }
        return toDto(tableRepository.save(table));
    }

    public List<TableResponse> getTablesByStatus(String status) {
        TableEntity.TableStatus parsedStatus = TableEntity.TableStatus.valueOf(status.toUpperCase());
        return tableRepository.findActiveByStatus(parsedStatus).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private TableResponse toDto(TableEntity table) {
        TableResponse dto = new TableResponse();
        dto.setTableId(table.getTableId());
        dto.setTableNumber(table.getTableNumber());
        dto.setCapacity(table.getCapacity());
        dto.setStatus(table.getStatus().name().toLowerCase());
        return dto;
    }
}

