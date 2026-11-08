
package com.brightloop.backend.controller;

import com.brightloop.backend.service.CustomerInvoiceService;
import com.brightloop.backend.service.RazorpayService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.brightloop.backend.dto.RazorpayVerifyRequest;
import com.brightloop.backend.dto.PaymentResponse;
import com.brightloop.backend.service.RazorpayVerificationService;
import jakarta.validation.Valid;


import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/customer/payments")
public class CustomerRazorpayController {

    private final RazorpayService razorpayService;
    private final CustomerInvoiceService customerInvoiceService;
    private final RazorpayVerificationService verificationService;

  
public CustomerRazorpayController(
        RazorpayService razorpayService,
        RazorpayVerificationService verificationService,
        CustomerInvoiceService customerInvoiceService) {

    this.razorpayService = razorpayService;
    this.verificationService = verificationService;
    this.customerInvoiceService = customerInvoiceService;
}


    // Create Razorpay order for the logged-in customer's invoice
    @PostMapping("/invoices/{invoiceId}/order")
    public ResponseEntity<Map<String, Object>> createOrder(
            @PathVariable Long invoiceId,
            @RequestBody(required = false) PaymentAmountRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        // Verify that this invoice belongs to the logged-in customer.
        customerInvoiceService.getMyInvoice(invoiceId, jwt);

        // Null means pay the entire outstanding balance.
        BigDecimal amount = request == null
                ? null
                : request.getAmount();

        Map<String, Object> response =
                razorpayService.createOrder(invoiceId, amount);

        return ResponseEntity.ok(response);
    }
    
// Verify a Razorpay Checkout payment
@PostMapping("/verify")
public ResponseEntity<PaymentResponse> verifyPayment(
        @Valid @RequestBody RazorpayVerifyRequest request,
        @AuthenticationPrincipal Jwt jwt) {

    PaymentResponse response =
            verificationService.verifyPayment(request, jwt);

    return ResponseEntity.ok(response);
}

public static class PaymentAmountRequest {

    private BigDecimal amount;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}

}
