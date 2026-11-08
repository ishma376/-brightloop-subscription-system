
package com.brightloop.backend.controller;

import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.service.OverdueInvoiceService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/overdue")
public class OverdueInvoiceController {

    private final OverdueInvoiceService overdueInvoiceService;

    public OverdueInvoiceController(
            OverdueInvoiceService overdueInvoiceService) {
        this.overdueInvoiceService = overdueInvoiceService;
    }

    // View overdue invoices
    @GetMapping("/invoices")
    public ResponseEntity<List<OverdueInvoiceResponse>> getOverdueInvoices() {

        List<OverdueInvoiceResponse> invoices =
                overdueInvoiceService.getOverdueInvoices()
                        .stream()
                        .map(OverdueInvoiceResponse::from)
                        .toList();

        return ResponseEntity.ok(invoices);
    }

    // View total outstanding overdue amount
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getOverdueSummary() {

        List<Invoice> invoices =
                overdueInvoiceService.getOverdueInvoices();

        BigDecimal totalOverdue =
                overdueInvoiceService.getTotalOverdueAmount();

        return ResponseEntity.ok(Map.of(
                "overdueInvoiceCount", invoices.size(),
                "totalOverdueAmount", totalOverdue
        ));
    }

    // Manually refresh overdue statuses
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Integer>> refreshOverdueInvoices() {

        int updated = overdueInvoiceService.updateOverdueInvoices();

        return ResponseEntity.ok(Map.of(
                "updatedInvoices", updated
        ));
    }

    // Response DTO avoids returning JPA entities directly.
    public record OverdueInvoiceResponse(
            Long id,
            String invoiceNumber,
            Long customerId,
            String customerName,
            String status,
            java.time.LocalDate dueDate,
            BigDecimal totalAmount,
            BigDecimal amountPaid,
            BigDecimal balanceDue
    ) {
        public static OverdueInvoiceResponse from(Invoice invoice) {
            return new OverdueInvoiceResponse(
                    invoice.getId(),
                    invoice.getInvoiceNumber(),
                    invoice.getCustomer().getId(),
                    invoice.getCustomer().getName(),
                    invoice.getStatus().name(),
                    invoice.getDueDate(),
                    invoice.getTotalAmount(),
                    invoice.getAmountPaid(),
                    invoice.getBalanceDue()
            );
        }
    }
}
