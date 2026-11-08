
package com.brightloop.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public class ProductVariantRequest {

    @NotBlank(message = "Variant name is required")
    private String name;

    @NotNull(message = "Price adjustment is required")
    @Digits(
        integer = 10,
        fraction = 2,
        message = "Price adjustment must have at most 2 decimal places"
    )
    private BigDecimal priceAdjustment;

    public ProductVariantRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getPriceAdjustment() {
        return priceAdjustment;
    }

    public void setPriceAdjustment(BigDecimal priceAdjustment) {
        this.priceAdjustment = priceAdjustment;
    }
}

