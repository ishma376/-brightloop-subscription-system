
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.PaymentRequest;
import com.brightloop.backend.dto.PaymentResponse;
import com.brightloop.backend.service.PaymentService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Record a payment against an invoice
    @PostMapping
    public ResponseEntity<PaymentResponse> recordPayment(
            @Valid @RequestBody PaymentRequest request) {

        PaymentResponse response = paymentService.recordPayment(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Get a payment by its ID
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(id)
        );
    }

    // Get all payments for a particular invoice
    @GetMapping("/invoice/{invoiceId}")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByInvoice(
            @PathVariable Long invoiceId) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByInvoice(invoiceId)
        );
    }
}
