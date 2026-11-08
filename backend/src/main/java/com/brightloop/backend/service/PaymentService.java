
package com.brightloop.backend.service;

import com.brightloop.backend.dto.PaymentRequest;
import com.brightloop.backend.dto.PaymentResponse;
import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;
import com.brightloop.backend.model.Payment;
import com.brightloop.backend.repository.PaymentRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import jakarta.transaction.Transactional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final EntityManager entityManager;

    public PaymentService(
            PaymentRepository paymentRepository,
            EntityManager entityManager) {

        this.paymentRepository = paymentRepository;
        this.entityManager = entityManager;
    }

    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request) {

        if (request.getInvoiceId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invoice ID is required"
            );
        }

        BigDecimal amount = request.getAmount();

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment amount must be greater than zero"
            );
        }

        if (amount.scale() > 2 || amount.precision() - amount.scale() > 10) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid payment amount"
            );
        }

        if (request.getPaymentMethod() == null
                || request.getPaymentMethod().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment method is required"
            );
        }

        if (request.getPaymentDate() == null
                || request.getPaymentDate().isAfter(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment date must not be in the future"
            );
        }

        // Lock invoice to prevent simultaneous overpayments.
        Invoice invoice = entityManager.find(
                Invoice.class,
                request.getInvoiceId(),
                LockModeType.PESSIMISTIC_WRITE
        );

        if (invoice == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Invoice not found"
            );
        }

        InvoiceStatus status = invoice.getStatus();

        if (status == InvoiceStatus.DRAFT
                || status == InvoiceStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Payments cannot be recorded for draft or cancelled invoices"
            );
        }

        if (status == InvoiceStatus.PAID) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice is already fully paid"
            );
        }

        BigDecimal balanceDue = invoice.getBalanceDue();

        if (balanceDue == null
                || balanceDue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice has no outstanding balance"
            );
        }

        if (amount.compareTo(balanceDue) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment exceeds outstanding invoice balance"
            );
        }

        // Create payment record.
        Payment payment = new Payment();

        payment.setInvoice(invoice);
        payment.setAmount(amount);
        payment.setPaymentMethod(
                request.getPaymentMethod().trim()
        );
        payment.setReferenceNumber(request.getReferenceNumber());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setNotes(request.getNotes());

        // Update invoice balances.
        BigDecimal updatedAmountPaid =
                invoice.getAmountPaid().add(amount);

        BigDecimal updatedBalance =
                balanceDue.subtract(amount);

        invoice.setAmountPaid(updatedAmountPaid);
        invoice.setBalanceDue(updatedBalance);

        if (updatedBalance.compareTo(BigDecimal.ZERO) == 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }

        // Both changes are committed together.
        entityManager.persist(payment);
        entityManager.flush();
        entityManager.refresh(payment);

        return toResponse(payment);
    }

    @Transactional
    public PaymentResponse getPaymentById(Long id) {

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Payment not found"
                ));

        return toResponse(payment);
    }

    @Transactional
    public List<PaymentResponse> getPaymentsByInvoice(Long invoiceId) {

        return paymentRepository
                .findByInvoiceIdOrderByCreatedAtDesc(invoiceId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private PaymentResponse toResponse(Payment payment) {

        Invoice invoice = payment.getInvoice();

        PaymentResponse response = new PaymentResponse();

        response.setId(payment.getId());
        response.setInvoiceId(invoice.getId());
        response.setInvoiceNumber(invoice.getInvoiceNumber());

        response.setCustomerName(
                invoice.getCustomer().getName()
        );

        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod());
        response.setReferenceNumber(payment.getReferenceNumber());
        response.setPaymentDate(payment.getPaymentDate());
        response.setNotes(payment.getNotes());
        response.setCreatedAt(payment.getCreatedAt());

        response.setInvoiceAmountPaid(invoice.getAmountPaid());
        response.setInvoiceBalanceDue(invoice.getBalanceDue());
        response.setInvoiceStatus(invoice.getStatus().name());

        return response;
    }
}
