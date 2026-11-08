
package com.brightloop.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscription_plans")
public class SubscriptionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id")
    private Product product;

    @Column(nullable = false, unique = true, length = 150)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "billing_period", nullable = false)
    private BillingPeriod billingPeriod;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "minimum_quantity", nullable = false)
    private Integer minimumQuantity = 1;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "allow_pause", nullable = false)
    private Boolean allowPause = false;

    @Column(name = "allow_early_close", nullable = false)
    private Boolean allowEarlyClose = false;

    @Column(name = "auto_close", nullable = false)
    private Boolean autoClose = false;

    @Column(name = "auto_renew", nullable = false)
    private Boolean autoRenew = true;

    @Column(name = "created_at", nullable = false,
            insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public SubscriptionPlan() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BillingPeriod getBillingPeriod() {
        return billingPeriod;
    }

    public void setBillingPeriod(BillingPeriod billingPeriod) {
        this.billingPeriod = billingPeriod;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public Integer getMinimumQuantity() {
        return minimumQuantity;
    }

    public void setMinimumQuantity(Integer minimumQuantity) {
        this.minimumQuantity = minimumQuantity;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public Boolean getAllowPause() {
        return allowPause;
    }

    public void setAllowPause(Boolean allowPause) {
        this.allowPause = allowPause;
    }

    public Boolean getAllowEarlyClose() {
        return allowEarlyClose;
    }

    public void setAllowEarlyClose(Boolean allowEarlyClose) {
        this.allowEarlyClose = allowEarlyClose;
    }

    public Boolean getAutoClose() {
        return autoClose;
    }

    public void setAutoClose(Boolean autoClose) {
        this.autoClose = autoClose;
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

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    @JsonProperty("productId")
    public Long getProductId() {
        return product != null ? product.getId() : null;
    }
}
