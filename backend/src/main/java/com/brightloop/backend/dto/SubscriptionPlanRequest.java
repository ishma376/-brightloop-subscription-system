
package com.brightloop.backend.dto;

import com.brightloop.backend.model.BillingPeriod;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class SubscriptionPlanRequest {

    private Long productId;

    @NotBlank(message = "Plan name is required")
    @Size(max = 150)
    private String name;

    @NotNull(message = "Billing period is required")
    private BillingPeriod billingPeriod;

    @NotNull(message = "Price is required")
    @DecimalMin(value = "0.00",
            message = "Price cannot be negative")
    @Digits(integer = 10, fraction = 2)
    private BigDecimal price;

    @NotNull(message = "Minimum quantity is required")
    @Min(value = 1,
            message = "Minimum quantity must be at least 1")
    private Integer minimumQuantity;

    @NotNull
    private Boolean isActive;

    @NotNull
    private Boolean allowPause;

    @NotNull
    private Boolean allowEarlyClose;

    @NotNull
    private Boolean autoClose;

    @NotNull
    private Boolean autoRenew;

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

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }
}
