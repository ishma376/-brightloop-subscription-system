
package com.brightloop.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PaymentResponse {

    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private String customerName;

    private BigDecimal amount;
    private String paymentMethod;
    private String referenceNumber;
    private LocalDate paymentDate;
    private String notes;
    private LocalDateTime createdAt;

    private BigDecimal invoiceAmountPaid;
    private BigDecimal invoiceBalanceDue;
    private String invoiceStatus;

    public PaymentResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getInvoiceId() {
        return invoiceId;
    }

    public void setInvoiceId(Long invoiceId) {
        this.invoiceId = invoiceId;
    }

    public String getInvoiceNumber() {
        return invoiceNumber;
    }

    public void setInvoiceNumber(String invoiceNumber) {
        this.invoiceNumber = invoiceNumber;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public LocalDate getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDate paymentDate) {
        this.paymentDate = paymentDate;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getInvoiceAmountPaid() {
        return invoiceAmountPaid;
    }

    public void setInvoiceAmountPaid(BigDecimal invoiceAmountPaid) {
        this.invoiceAmountPaid = invoiceAmountPaid;
    }

    public BigDecimal getInvoiceBalanceDue() {
        return invoiceBalanceDue;
    }

    public void setInvoiceBalanceDue(BigDecimal invoiceBalanceDue) {
        this.invoiceBalanceDue = invoiceBalanceDue;
    }

    public String getInvoiceStatus() {
        return invoiceStatus;
    }

    public void setInvoiceStatus(String invoiceStatus) {
        this.invoiceStatus = invoiceStatus;
    }
}
