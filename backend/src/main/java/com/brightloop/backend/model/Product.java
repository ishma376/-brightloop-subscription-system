
package com.brightloop.backend.model;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(
        name = "sales_price",
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal salesPrice;

    @Column(
        name = "cost_price",
        nullable = false,
        precision = 12,
        scale = 2
    )
    private BigDecimal costPrice;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public Product() {
    }

    public Product(
            String name,
            String type,
            BigDecimal salesPrice,
            BigDecimal costPrice,
            String notes) {

        this.name = name;
        this.type = type;
        this.salesPrice = salesPrice;
        this.costPrice = costPrice;
        this.notes = notes;
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

