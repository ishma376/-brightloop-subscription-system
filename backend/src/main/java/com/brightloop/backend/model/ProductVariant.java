
package com.brightloop.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String name;

    @Column(
        name = "price_adjustment",
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal priceAdjustment;

    public ProductVariant() {
    }

    public ProductVariant(
            Product product,
            String name,
            BigDecimal priceAdjustment) {

        this.product = product;
        this.name = name;
        this.priceAdjustment = priceAdjustment;
    }

    public Long getId() {
        return id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
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

    public void setPriceAdjustment(
            BigDecimal priceAdjustment) {

        this.priceAdjustment = priceAdjustment;
    }
}

