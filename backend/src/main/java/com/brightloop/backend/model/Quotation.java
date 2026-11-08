
package com.brightloop.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "quotations")
public class Quotation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "quotation_number",
            nullable = false, unique = true, length = 50)
    private String quotationNumber;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private QuotationStatus status = QuotationStatus.DRAFT;

    @Column(name = "quotation_date", nullable = false)
    private LocalDate quotationDate;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "created_at", nullable = false,
            insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Quotation() {
    }

    @PrePersist
    public void beforeCreate() {
        if (quotationDate == null) {
            quotationDate = LocalDate.now();
        }

        if (status == null) {
            status = QuotationStatus.DRAFT;
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

    public String getQuotationNumber() {
        return quotationNumber;
    }

    public void setQuotationNumber(String quotationNumber) {
        this.quotationNumber = quotationNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public QuotationStatus getStatus() {
        return status;
    }

    public void setStatus(QuotationStatus status) {
        this.status = status;
    }

    public LocalDate getQuotationDate() {
        return quotationDate;
    }

    public void setQuotationDate(LocalDate quotationDate) {
        this.quotationDate = quotationDate;
    }

    public LocalDate getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(LocalDate validUntil) {
        this.validUntil = validUntil;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
