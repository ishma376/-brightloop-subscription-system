
package com.brightloop.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public class TaxRequest {

    @NotBlank(message = "Tax name is required")
    @Size(max = 100, message = "Tax name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Tax rate is required")
    @DecimalMin(value = "0.00", message = "Tax rate cannot be negative")
    @DecimalMax(value = "100.00", message = "Tax rate cannot exceed 100%")
    @Digits(integer = 3, fraction = 2)
    private BigDecimal rate;

    @NotNull(message = "Active status is required")
    private Boolean isActive;

    public TaxRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getRate() {
        return rate;
    }

    public void setRate(BigDecimal rate) {
        this.rate = rate;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }
}

