
package com.brightloop.backend.dto;

import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class InvoiceResponse {

    private Long id;
    private String invoiceNumber;

    private Long customerId;
    private String customerName;

    private Long subscriptionId;

    private InvoiceStatus status;

    private LocalDate invoiceDate;
    private LocalDate dueDate;
    private LocalDate billingPeriodStart;
    private LocalDate billingPeriodEnd;

    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal taxableAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public InvoiceResponse() {
    }

    public static InvoiceResponse fromEntity(Invoice invoice) {

        InvoiceResponse response = new InvoiceResponse();

        response.id = invoice.getId();
        response.invoiceNumber = invoice.getInvoiceNumber();

        response.customerId = invoice.getCustomer().getId();
        response.customerName = invoice.getCustomer().getName();

        response.subscriptionId =
                invoice.getSubscription().getId();

        response.status = invoice.getStatus();

        response.invoiceDate = invoice.getInvoiceDate();
        response.dueDate = invoice.getDueDate();

        response.billingPeriodStart =
                invoice.getBillingPeriodStart();

        response.billingPeriodEnd =
                invoice.getBillingPeriodEnd();

        response.subtotal = invoice.getSubtotal();
        response.discountAmount = invoice.getDiscountAmount();
        response.taxableAmount = invoice.getTaxableAmount();
        response.taxAmount = invoice.getTaxAmount();
        response.totalAmount = invoice.getTotalAmount();
        response.amountPaid = invoice.getAmountPaid();
        response.balanceDue = invoice.getBalanceDue();

        response.createdAt = invoice.getCreatedAt();
        response.updatedAt = invoice.getUpdatedAt();

        return response;
    }

    public Long getId() {
        return id;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public Long getSubscriptionId() {
        return subscriptionId;
    }

    public InvoiceStatus getStatus() {
        return status;
    }

    public LocalDate getInvoiceDate() {
        return invoiceDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public LocalDate getBillingPeriodStart() {
        return billingPeriodStart;
    }

    public LocalDate getBillingPeriodEnd() {
        return billingPeriodEnd;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public BigDecimal getTaxableAmount() {
        return taxableAmount;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public BigDecimal getAmountPaid() {
        return amountPaid;
    }

    public BigDecimal getBalanceDue() {
        return balanceDue;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
