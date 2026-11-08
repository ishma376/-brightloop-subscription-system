
package com.brightloop.backend.service;

import com.brightloop.backend.dto.PaymentRequest;
import com.brightloop.backend.dto.PaymentResponse;
import com.brightloop.backend.dto.RazorpayVerifyRequest;

import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;
import com.brightloop.backend.model.RazorpayOrder;
import com.brightloop.backend.model.SubscriptionStatus;

import com.brightloop.backend.repository.RazorpayOrderRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.security.oauth2.jwt.Jwt;


import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class RazorpayVerificationService {

    private final RazorpayOrderRepository orderRepository;
    private final RazorpaySignatureService signatureService;
    private final RazorpayPaymentLookupService paymentLookupService;
    private final PaymentService paymentService;
    private final SubscriptionService subscriptionService;
    private final CustomerInvoiceService customerInvoiceService;
    private final EntityManager entityManager;

   
public RazorpayVerificationService(
        RazorpayOrderRepository orderRepository,
        RazorpaySignatureService signatureService,
        RazorpayPaymentLookupService paymentLookupService,
        PaymentService paymentService,
        SubscriptionService subscriptionService,
        CustomerInvoiceService customerInvoiceService,
        EntityManager entityManager) {

    this.orderRepository = orderRepository;
    this.signatureService = signatureService;
    this.paymentLookupService = paymentLookupService;
    this.paymentService = paymentService;
    this.subscriptionService = subscriptionService;
    this.customerInvoiceService = customerInvoiceService;
    this.entityManager = entityManager;
}


    @Transactional
   
public PaymentResponse verifyPayment(
        RazorpayVerifyRequest request,
        Jwt jwt) {

        // 1. Find and lock the Razorpay order.
        RazorpayOrder order = orderRepository
                .findLockedByRazorpayOrderId(
                        request.getRazorpayOrderId()
                )
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Razorpay order not found"
                ));
                
// Verify the authenticated customer owns this invoice.
customerInvoiceService.getMyInvoice(
        order.getInvoice().getId(),
        jwt
);


        // 2. Prevent processing an order twice.
        if ("PAID".equals(order.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Razorpay order is already paid"
            );
        }

        if (!"CREATED".equals(order.getStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Razorpay order is not eligible for verification"
            );
        }

        // 3. Verify signature using the stored order ID.
        boolean validSignature = signatureService.verifySignature(
                order.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (!validSignature) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid Razorpay payment signature"
            );
        }

        // 4. Check whether payment ID is already recorded.
        if (orderRepository.existsByRazorpayPaymentId(
                request.getRazorpayPaymentId())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Razorpay payment already processed"
            );
        }

        // 5. Verify actual captured payment with Razorpay.
        paymentLookupService.verifyCapturedPayment(
                order,
                request.getRazorpayPaymentId()
        );

        // 6. Lock the invoice before checking its balance.
        Invoice invoice = entityManager.find(
                Invoice.class,
                order.getInvoice().getId(),
                LockModeType.PESSIMISTIC_WRITE
        );

        if (invoice == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Invoice not found"
            );
        }

        // Convert the stored order amount from paise to INR.
        BigDecimal amount = BigDecimal.valueOf(
                order.getAmountPaise(),
                2
        );

        // Prevent an old order from overpaying an invoice.
        if (invoice.getBalanceDue() == null
                || invoice.getBalanceDue().compareTo(amount) < 0) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice balance changed since order creation"
            );
        }

        // 7. Build the payment request.
        PaymentRequest paymentRequest = new PaymentRequest();

        paymentRequest.setInvoiceId(invoice.getId());
        paymentRequest.setAmount(amount);
        paymentRequest.setPaymentMethod("RAZORPAY");
        paymentRequest.setReferenceNumber(
                request.getRazorpayPaymentId()
        );
        paymentRequest.setPaymentDate(LocalDate.now());
        paymentRequest.setNotes(
                "Verified Razorpay payment for order "
                        + order.getRazorpayOrderId()
        );

        // 8. Record payment and update invoice balances.
        PaymentResponse response =
                paymentService.recordPayment(paymentRequest);

        // 9. Mark Razorpay order as paid.
        order.setRazorpayPaymentId(
                request.getRazorpayPaymentId()
        );
        order.setStatus("PAID");
        order.setVerifiedAt(
                java.time.LocalDateTime.now()
        );

        orderRepository.saveAndFlush(order);

        // Ensure the payment and invoice updates are flushed.
        entityManager.flush();

        // Identify an initial customer checkout invoice.
        // The prefix is temporary until we add a dedicated
        // checkout record or database field.
        boolean isCheckoutInvoice =
                invoice.getInvoiceNumber() != null
                && invoice.getInvoiceNumber().startsWith("INV-CHK-");

        // Activate only when the entire invoice is paid.
        boolean fullyPaid =
                invoice.getStatus() == InvoiceStatus.PAID
                && invoice.getBalanceDue() != null
                && invoice.getBalanceDue()
                        .compareTo(BigDecimal.ZERO) == 0;

        if (isCheckoutInvoice && fullyPaid) {

            Long subscriptionId =
                    invoice.getSubscription().getId();

            if (invoice.getSubscription().getStatus()
                    == SubscriptionStatus.CONFIRMED) {

                subscriptionService.activateSubscription(
                        subscriptionId
                );
            }
        }

        return response;
    }
}
