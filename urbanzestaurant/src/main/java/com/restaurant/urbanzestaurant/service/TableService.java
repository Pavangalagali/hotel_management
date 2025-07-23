package com.restaurant.urbanzestaurant.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.TableRequest;
import com.restaurant.urbanzestaurant.dto.TableResponse;
import com.restaurant.urbanzestaurant.entity.TableEntity;
import com.restaurant.urbanzestaurant.repository.TableRepository;

import jakarta.transaction.Transactional;

@Service
public class TableService {

	@Autowired
	private TableRepository tableRepository;

	public List<TableResponse> getAllTables() {
		return tableRepository.findAll().stream().map(this::toDto).collect(Collectors.toList());

	}

	public TableResponse addTable(TableRequest request) {
		if (tableRepository.existsByTableNumber(request.getTableNumber())) {
			throw new RuntimeException("Table already exists.");
		}

		TableEntity table = new TableEntity();
		table.setTableNumber(request.getTableNumber());
		table.setCapacity(request.getCapacity());
		table.setStatus(TableEntity.TableStatus.FREE);

		return toDto(tableRepository.save(table));
	}

	@Transactional
	public void deleteByTableNumber(Integer tableNumber) {
		if (!tableRepository.existsByTableNumber(tableNumber)) {
			throw new RuntimeException("Table not found.");
		}
		tableRepository.deleteByTableNumber(tableNumber);
	}

	public TableResponse assignTable(Integer tableNumber,String status) {
		TableEntity table = tableRepository.findByTableNumber(tableNumber)
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
		return tableRepository.findByStatus(parsedStatus).stream().map(this::toDto).collect(Collectors.toList());
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
