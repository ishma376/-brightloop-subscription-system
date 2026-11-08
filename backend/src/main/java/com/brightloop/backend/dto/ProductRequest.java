
package com.brightloop.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;

import java.math.BigDecimal;

public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    @NotBlank(message = "Product type is required")
    private String type;

    @NotNull(message = "Sales price is required")
    @DecimalMin(
        value = "0.00",
        message = "Sales price cannot be negative"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal salesPrice;

    @NotNull(message = "Cost price is required")
    @DecimalMin(
        value = "0.00",
        message = "Cost price cannot be negative"
    )
    @Digits(integer = 10, fraction = 2)
    private BigDecimal costPrice;

    private String notes;

    public ProductRequest() {
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public BigDecimal getSalesPrice() {
        return salesPrice;
    }

    public void setSalesPrice(BigDecimal salesPrice) {
        this.salesPrice = salesPrice;
    }

    public BigDecimal getCostPrice() {
        return costPrice;
    }

    public void setCostPrice(BigDecimal costPrice) {
        this.costPrice = costPrice;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}

