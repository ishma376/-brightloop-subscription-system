
package com.brightloop.backend.dto;

import com.brightloop.backend.model.Quotation;
import com.brightloop.backend.model.QuotationStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class QuotationResponse {

    private Long id;
    private String quotationNumber;
    private Long customerId;
    private String customerName;
    private QuotationStatus status;
    private LocalDate quotationDate;
    private LocalDate validUntil;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public QuotationResponse() {
    }

    public static QuotationResponse fromEntity(Quotation quotation) {

        QuotationResponse response = new QuotationResponse();

        response.id = quotation.getId();
        response.quotationNumber = quotation.getQuotationNumber();
        response.customerId = quotation.getCustomer().getId();
        response.customerName = quotation.getCustomer().getName();
        response.status = quotation.getStatus();
        response.quotationDate = quotation.getQuotationDate();
        response.validUntil = quotation.getValidUntil();
        response.notes = quotation.getNotes();
        response.createdAt = quotation.getCreatedAt();
        response.updatedAt = quotation.getUpdatedAt();

        return response;
    }

    public Long getId() {
        return id;
    }

    public String getQuotationNumber() {
        return quotationNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public QuotationStatus getStatus() {
        return status;
    }

    public LocalDate getQuotationDate() {
        return quotationDate;
    }

    public LocalDate getValidUntil() {
        return validUntil;
    }

    public String getNotes() {
        return notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
