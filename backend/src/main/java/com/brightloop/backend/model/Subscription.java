
package com.brightloop.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id", unique = true)
    private Quotation quotation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "plan_id", nullable = false)
    private SubscriptionPlan plan;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SubscriptionStatus status = SubscriptionStatus.DRAFT;

    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "next_billing_date")
    private LocalDate nextBillingDate;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = false;

    @Column(
        name = "created_at",
        nullable = false,
        insertable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Subscription() {
    }

    @PrePersist
    public void beforeCreate() {
        if (status == null) {
            status = SubscriptionStatus.DRAFT;
        }

        if (autoRenew == null) {
            autoRenew = false;
        }

        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void beforeUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Quotation getQuotation() {
        return quotation;
    }

    public void setQuotation(Quotation quotation) {
        this.quotation = quotation;
    }

    public SubscriptionPlan getPlan() {
        return plan;
    }

    public void setPlan(SubscriptionPlan plan) {
        this.plan = plan;
    }

    public SubscriptionStatus getStatus() {
        return status;
    }

    public void setStatus(SubscriptionStatus status) {
        this.status = status;
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

    public LocalDate getNextBillingDate() {
        return nextBillingDate;
    }

    public void setNextBillingDate(LocalDate nextBillingDate) {
        this.nextBillingDate = nextBillingDate;
    }

    public Boolean getAutoRenew() {
        return autoRenew;
    }

    public void setAutoRenew(Boolean autoRenew) {
        this.autoRenew = autoRenew;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
