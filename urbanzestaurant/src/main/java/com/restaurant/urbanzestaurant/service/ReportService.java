package com.restaurant.urbanzestaurant.service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.restaurant.urbanzestaurant.dto.SalesReportDTO;
import com.restaurant.urbanzestaurant.entity.Bill;
import com.restaurant.urbanzestaurant.repository.BillRepository;

@Service
public class ReportService {

	@Autowired
    private  BillRepository billRepo;

    public SalesReportDTO getDailyReport(LocalDate date) {
        List<Bill> bills = billRepo.findByPaidAtBetween(
            date.atStartOfDay(), date.plusDays(1).atStartOfDay()
        );

        return mapToDto(date, bills);
    }

    public List<SalesReportDTO> getMonthlyReport(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1);
        System.out.println("Start --> " + start.getMonth().name());
        System.out.println("End --> " + end.getMonth().name());
        List<Bill> allBills = billRepo.findByPaidAtBetween(start.atStartOfDay(), end.atStartOfDay());

        System.out.println("Bills --> "+ allBills.size());
        // Group by day
        return allBills.stream()
            .collect(Collectors.groupingBy(b -> b.getPaidAt().toLocalDate()))
            .entrySet().stream()
            .map(e -> mapToDto(e.getKey(), e.getValue()))
            .sorted(Comparator.comparing(SalesReportDTO::getDate))
            .toList();
    }

    private SalesReportDTO mapToDto(LocalDate date, List<Bill> bills) {
        BigDecimal revenue = bills.stream()
            .map(Bill::getTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal tax = bills.stream()
            .map(Bill::getTax)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        SalesReportDTO dto = new SalesReportDTO();
        dto.setDate(date);
        dto.setTotalOrders(bills.size());
        dto.setTotalRevenue(revenue);
        dto.setTotalTax(tax);
        return dto;
    }
    
    public SalesReportDTO getDailyReportActiveOrdersOnly(LocalDate date) {
        List<Bill> bills = billRepo.findByPaidAtBetweenForActiveOrders(
            date.atStartOfDay(), date.plusDays(1).atStartOfDay()
        );
        return mapToDto(date, bills);
    }

    public List<SalesReportDTO> getMonthlyReportActiveOrdersOnly(int year, int month) {
        LocalDate start = LocalDate.of(year, month, 1);
        LocalDate end = start.plusMonths(1);
        
        List<Bill> allBills = billRepo.findByPaidAtBetweenForActiveOrders(
            start.atStartOfDay(), end.atStartOfDay()
        );

        return allBills.stream()
            .collect(Collectors.groupingBy(b -> b.getPaidAt().toLocalDate()))
            .entrySet().stream()
            .map(e -> mapToDto(e.getKey(), e.getValue()))
            .sorted(Comparator.comparing(SalesReportDTO::getDate))
            .toList();
    }
}