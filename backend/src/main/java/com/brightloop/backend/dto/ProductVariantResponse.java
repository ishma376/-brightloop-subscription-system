
package com.brightloop.backend.dto;

import com.brightloop.backend.model.ProductVariant;
import java.math.BigDecimal;

public class ProductVariantResponse {

    private Long id;
    private Long productId;
    private String name;
    private BigDecimal priceAdjustment;
    private BigDecimal finalPrice;

    public ProductVariantResponse(ProductVariant variant) {

        this.id = variant.getId();
        this.productId = variant.getProduct().getId();
        this.name = variant.getName();
        this.priceAdjustment = variant.getPriceAdjustment();

        this.finalPrice = variant.getProduct()
                .getSalesPrice()
                .add(variant.getPriceAdjustment());
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getName() {
        return name;
    }

    public BigDecimal getPriceAdjustment() {
        return priceAdjustment;
    }

    public BigDecimal getFinalPrice() {
        return finalPrice;
    }
}
