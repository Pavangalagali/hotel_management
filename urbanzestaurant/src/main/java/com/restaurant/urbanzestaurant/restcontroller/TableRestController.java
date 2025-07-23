package com.restaurant.urbanzestaurant.restcontroller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.dto.TableRequest;
import com.restaurant.urbanzestaurant.dto.TableResponse;
import com.restaurant.urbanzestaurant.service.TableService;

@RestController
@RequestMapping("/api/tables")
public class TableRestController {

	@Autowired
    private TableService tableService;

	@GetMapping("/all")
    public ResponseEntity<List<TableResponse>> getTables() {
        return ResponseEntity.ok(tableService.getAllTables());
    }
	
    @PostMapping
    public ResponseEntity<TableResponse> addTable(@RequestBody TableRequest request) {
        return new ResponseEntity<>(tableService.addTable(request), HttpStatus.CREATED);
    }

    @DeleteMapping("/delete/{tableNumber}")
    public ResponseEntity<Void> deleteTable(@PathVariable Integer tableNumber) {
        tableService.deleteByTableNumber(tableNumber);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/assign/{tableNumber}/{status}")
    public ResponseEntity<TableResponse> assignTable(@PathVariable Integer tableNumber,@PathVariable String status) {
    	System.out.println("Statussssssssssssssss  " + status);
        return ResponseEntity.ok(tableService.assignTable(tableNumber,status));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TableResponse>> getTablesByStatus(@PathVariable String status) {
        return ResponseEntity.ok(tableService.getTablesByStatus(status));
    }
}
