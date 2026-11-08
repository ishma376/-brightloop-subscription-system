
package com.brightloop.backend.controller;

import com.brightloop.backend.service.FinancialReportService;
import com.brightloop.backend.service.FinancialReportService.MonthlyCollectionResponse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.brightloop.backend.service.FinancialReportService.OutstandingInvoiceResponse;

import com.brightloop.backend.service.FinancialReportService.PaymentMethodResponse;


import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class FinancialReportController {

    private final FinancialReportService financialReportService;

    public FinancialReportController(
            FinancialReportService financialReportService) {
        this.financialReportService = financialReportService;
    }

    @GetMapping("/monthly-collections")
    public ResponseEntity<List<MonthlyCollectionResponse>>
            getMonthlyCollections() {

        List<MonthlyCollectionResponse> report =
                financialReportService.getMonthlyCollections();

        return ResponseEntity.ok(report);
    }
    
@GetMapping("/outstanding-invoices")
public ResponseEntity<List<OutstandingInvoiceResponse>>
        getOutstandingInvoices() {

    List<OutstandingInvoiceResponse> report =
            financialReportService.getOutstandingInvoices();

    return ResponseEntity.ok(report);
}

@GetMapping("/payment-methods")
public ResponseEntity<List<PaymentMethodResponse>>
        getPaymentMethodReport() {

    List<PaymentMethodResponse> report =
            financialReportService.getPaymentMethodReport();

    return ResponseEntity.ok(report);
}


}
