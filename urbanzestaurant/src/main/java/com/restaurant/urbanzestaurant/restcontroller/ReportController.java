package com.restaurant.urbanzestaurant.restcontroller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.restaurant.urbanzestaurant.dto.SalesReportDTO;
import com.restaurant.urbanzestaurant.service.ReportService;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

	@Autowired
    private  ReportService reportService;

    @GetMapping("/daily")
    public ResponseEntity<SalesReportDTO> daily(@RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(reportService.getDailyReport(date));
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<SalesReportDTO>> monthly(@RequestParam int year, @RequestParam int month) {
        return ResponseEntity.ok(reportService.getMonthlyReport(year, month));
    }
}

