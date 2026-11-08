
package com.brightloop.backend.dto;

import com.brightloop.backend.model.Subscription;
import com.brightloop.backend.model.SubscriptionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class SubscriptionResponse {

    private Long id;
    private Long customerId;
    private String customerName;
    private Long quotationId;
    private Long planId;
    private String planName;
    private SubscriptionStatus status;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextBillingDate;
    private Boolean autoRenew;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public SubscriptionResponse() {
    }

    public static SubscriptionResponse fromEntity(
            Subscription subscription) {

        SubscriptionResponse response =
                new SubscriptionResponse();

        response.id = subscription.getId();

        response.customerId =
                subscription.getCustomer().getId();

        response.customerName =
                subscription.getCustomer().getName();

        if (subscription.getQuotation() != null) {
            response.quotationId =
                    subscription.getQuotation().getId();
        }

        response.planId =
                subscription.getPlan().getId();

        response.planName =
                subscription.getPlan().getName();

        response.status = subscription.getStatus();
        response.startDate = subscription.getStartDate();
        response.endDate = subscription.getEndDate();

        response.nextBillingDate =
                subscription.getNextBillingDate();

        response.autoRenew = subscription.getAutoRenew();
        response.createdAt = subscription.getCreatedAt();
        response.updatedAt = subscription.getUpdatedAt();

        return response;
    }

    public Long getId() {
        return id;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public Long getQuotationId() {
        return quotationId;
    }

    public Long getPlanId() {
        return planId;
    }

    public String getPlanName() {
        return planName;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public LocalDate getNextBillingDate() {
        return nextBillingDate;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
