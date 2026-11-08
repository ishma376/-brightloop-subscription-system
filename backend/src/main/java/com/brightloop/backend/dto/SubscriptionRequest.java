
package com.brightloop.backend.dto;

import jakarta.validation.constraints.*;
import java.time.LocalDate;

public class SubscriptionRequest {

    @NotNull(message = "Customer ID is required")
    @Positive(message = "Customer ID must be positive")
    private Long customerId;

    @Positive(message = "Quotation ID must be positive")
    private Long quotationId;

    @NotNull(message = "Subscription plan ID is required")
    @Positive(message = "Plan ID must be positive")
    private Long planId;

    @NotNull(message = "Start date is required")
    private LocalDate startDate;

    private LocalDate endDate;

    @NotNull(message = "Auto-renew preference is required")
    private Boolean autoRenew;

    public SubscriptionRequest() {
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public void setQuotationId(Long quotationId) {
        this.quotationId = quotationId;
    }

    public Long getPlanId() {
        return planId;
    }

    public void setPlanId(Long planId) {
        this.planId = planId;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public void setAutoRenew(Boolean autoRenew) {
        this.autoRenew = autoRenew;
    }
}
