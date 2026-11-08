
package com.brightloop.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "razorpay_orders")
public class RazorpayOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @Column(
        name = "razorpay_order_id",
        nullable = false,
        unique = true,
        length = 100
    )
    private String razorpayOrderId;

    @Column(
        name = "razorpay_payment_id",
        unique = true,
        length = 100
    )
    private String razorpayPaymentId;

    @Column(name = "amount_paise", nullable = false)
    private Long amountPaise;

    @Column(nullable = false, length = 10)
    private String currency = "INR";

    @Column(nullable = false, length = 30)
    private String status = "CREATED";

    @Column(
        name = "created_at",
        nullable = false,
        insertable = false,
        updatable = false
    )
    private LocalDateTime createdAt;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    public RazorpayOrder() {
    }

    public Long getId() {
        return id;
    }

    public Invoice getInvoice() {
        return invoice;
    }

    public void setInvoice(Invoice invoice) {
        this.invoice = invoice;
    }

    public String getRazorpayOrderId() {
        return razorpayOrderId;
    }

    public void setRazorpayOrderId(String razorpayOrderId) {
        this.razorpayOrderId = razorpayOrderId;
    }

    public String getRazorpayPaymentId() {
        return razorpayPaymentId;
    }

    public void setRazorpayPaymentId(String razorpayPaymentId) {
        this.razorpayPaymentId = razorpayPaymentId;
    }

    public Long getAmountPaise() {
        return amountPaise;
    }

    public void setAmountPaise(Long amountPaise) {
        this.amountPaise = amountPaise;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public void setVerifiedAt(LocalDateTime verifiedAt) {
        this.verifiedAt = verifiedAt;
    }
}
