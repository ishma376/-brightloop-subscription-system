
package com.brightloop.backend.service;

import com.brightloop.backend.dto.InvoiceRequest;
import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;
import com.brightloop.backend.model.Subscription;
import com.brightloop.backend.model.SubscriptionStatus;
import com.brightloop.backend.repository.InvoiceRepository;
import com.brightloop.backend.repository.SubscriptionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final SubscriptionRepository subscriptionRepository;

    public InvoiceService(
            InvoiceRepository invoiceRepository,
            SubscriptionRepository subscriptionRepository) {

        this.invoiceRepository = invoiceRepository;
        this.subscriptionRepository = subscriptionRepository;
    }

    // GENERATE INVOICE
    @Transactional
    public Invoice generateInvoice(InvoiceRequest request) {

        // Find subscription
        Subscription subscription = subscriptionRepository
                .findById(request.getSubscriptionId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Subscription not found"
                ));

        // Only ACTIVE subscriptions can be billed
        if (subscription.getStatus()
                != SubscriptionStatus.ACTIVE) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only ACTIVE subscriptions can be billed"
            );
        }

        LocalDate today = LocalDate.now();
        LocalDate periodStart = request.getBillingPeriodStart();
        LocalDate periodEnd = request.getBillingPeriodEnd();

        // Validate billing dates
        if (periodEnd.isBefore(periodStart)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Billing period end cannot be before start"
            );
        }

        if (request.getDueDate().isBefore(today)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Due date cannot be before invoice date"
            );
        }

        if (periodStart.isBefore(subscription.getStartDate())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Billing period cannot start before subscription"
            );
        }

        if (subscription.getEndDate() != null
                && periodEnd.isAfter(subscription.getEndDate())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Billing period exceeds subscription end date"
            );
        }

        // Check billing period length against the plan
        LocalDate expectedEnd;

        switch (subscription.getPlan().getBillingPeriod()) {

            case DAILY:
                expectedEnd = periodStart;
                break;

            case WEEKLY:
                expectedEnd = periodStart.plusWeeks(1).minusDays(1);
                break;

            case MONTHLY:
                expectedEnd = periodStart.plusMonths(1).minusDays(1);
                break;

            case YEARLY:
                expectedEnd = periodStart.plusYears(1).minusDays(1);
                break;

            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unsupported billing period"
                );
        }

        if (!periodEnd.equals(expectedEnd)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Billing period does not match subscription plan"
            );
        }

        // Prevent duplicate invoice generation
        boolean alreadyExists = invoiceRepository
                .existsBySubscriptionIdAndBillingPeriodStart(
                        subscription.getId(),
                        periodStart
                );

        if (alreadyExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice already exists for this billing period"
            );
        }

        // Calculate invoice amounts
        BigDecimal subtotal = subscription.getPlan().getPrice();

        BigDecimal discountAmount = BigDecimal.ZERO;
        BigDecimal taxableAmount = subtotal;
        BigDecimal taxAmount = BigDecimal.ZERO;

        BigDecimal totalAmount = taxableAmount.add(taxAmount);

        // Create invoice
        Invoice invoice = new Invoice();

        invoice.setInvoiceNumber(
                "INV-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        invoice.setCustomer(subscription.getCustomer());
        invoice.setSubscription(subscription);

        invoice.setStatus(InvoiceStatus.DRAFT);

        invoice.setInvoiceDate(today);
        invoice.setDueDate(request.getDueDate());

        invoice.setBillingPeriodStart(periodStart);
        invoice.setBillingPeriodEnd(periodEnd);

        invoice.setSubtotal(subtotal);
        invoice.setDiscountAmount(discountAmount);
        invoice.setTaxableAmount(taxableAmount);
        invoice.setTaxAmount(taxAmount);
        invoice.setTotalAmount(totalAmount);

        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setBalanceDue(totalAmount);

        return invoiceRepository.saveAndFlush(invoice);
    }

    // GET ALL INVOICES
    @Transactional(readOnly = true)
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // GET INVOICE BY ID
    @Transactional(readOnly = true)
    public Invoice getInvoiceById(Long id) {

        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invoice not found"
                ));
    }

    // GET INVOICES BY CUSTOMER
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByCustomer(Long customerId) {
        return invoiceRepository.findByCustomerId(customerId);
    }

    // GET INVOICES BY SUBSCRIPTION
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesBySubscription(Long subscriptionId) {
        return invoiceRepository.findBySubscriptionId(subscriptionId);
    }

    // GET INVOICES BY STATUS
    @Transactional(readOnly = true)
    public List<Invoice> getInvoicesByStatus(InvoiceStatus status) {
        return invoiceRepository.findByStatus(status);
    }
    
    // ISSUE INVOICE
    @Transactional
    public Invoice issueInvoice(Long id) {

        // Find the invoice
        Invoice invoice = getInvoiceById(id);

        // Only DRAFT invoices can be issued
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only DRAFT invoices can be issued"
            );
        }

        // Check that the invoice has a valid amount
        if (invoice.getTotalAmount() == null
                || invoice.getTotalAmount()
                        .compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invoice total must be greater than zero"
            );
        }

        // Change status to ISSUED
        invoice.setStatus(InvoiceStatus.ISSUED);

        return invoiceRepository.save(invoice);
    }

}
