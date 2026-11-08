
package com.brightloop.backend.service;

import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;
import com.brightloop.backend.repository.InvoiceRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Scheduled;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class OverdueInvoiceService {

    private final InvoiceRepository invoiceRepository;

    public OverdueInvoiceService(
            InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    // Find invoices that have passed their due date
    @Transactional
    public int updateOverdueInvoices() {

        LocalDate today = LocalDate.now();

        List<Invoice> candidates =
                invoiceRepository.findOverdueCandidates(
                        today,
                        List.of(
                                InvoiceStatus.ISSUED,
                                InvoiceStatus.PARTIALLY_PAID
                        )
                );

        for (Invoice invoice : candidates) {
            invoice.setStatus(InvoiceStatus.OVERDUE);
        }

        invoiceRepository.saveAll(candidates);

        return candidates.size();
    }

    // Retrieve all invoices currently overdue
    @Transactional(readOnly = true)
    public List<Invoice> getOverdueInvoices() {

        return invoiceRepository.findInvoicesByStatusWithBalance(
                InvoiceStatus.OVERDUE
        );
    }

    // Calculate the total outstanding overdue amount
    @Transactional(readOnly = true)
    public BigDecimal getTotalOverdueAmount() {

        return getOverdueInvoices()
                .stream()
                .map(Invoice::getBalanceDue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Automatically check overdue invoices every day at 1 AM
    @Scheduled(cron = "0 0 1 * * *", zone = "Asia/Kolkata")
    public void scheduledOverdueCheck() {

        int updated = updateOverdueInvoices();

        if (updated > 0) {
            System.out.println(
                    "Brightloop: Marked " + updated
                    + " invoices as OVERDUE."
            );
        }
    }
}
