
package com.brightloop.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class QuotationRequest {

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be positive")
    private Long customerId;

    @FutureOrPresent(
        message = "Validity date cannot be in the past"
    )
    private LocalDate validUntil;

    @Size(max = 2000, message = "Notes must not exceed 2000 characters")
    private String notes;

    public QuotationRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public LocalDate getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDate validUntil) {
        this.validUntil = validUntil;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
