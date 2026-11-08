
package com.brightloop.backend.dto;

import com.brightloop.backend.model.DiscountType;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class DiscountRequest {

    @NotBlank(message = "Discount name is required")
    @Size(max = 100, message = "Discount name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Discount type is required")
    private DiscountType discountType;

    @NotNull(message = "Discount value is required")
    @DecimalMin(
        value = "0.00",
        inclusive = false,
        message = "Discount value must be greater than zero"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal value;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    public DiscountRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public DiscountType getDiscountType() {
        return discountType;
    }

    public void setDiscountType(DiscountType discountType) {
        this.discountType = discountType;
    }

    public BigDecimal getValue() {
        return value;
    }

    public void setValue(BigDecimal value) {
        this.value = value;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}
