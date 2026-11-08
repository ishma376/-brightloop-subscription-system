
package com.brightloop.backend.controller;

import com.brightloop.backend.service.CustomerCheckoutService;
import com.brightloop.backend.service.CustomerCheckoutService.CheckoutResponse;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

@RestController
@RequestMapping("/api/customer/checkout")
public class CustomerCheckoutController {

    private final CustomerCheckoutService checkoutService;

    public CustomerCheckoutController(
            CustomerCheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    public record CheckoutRequest(
            @NotNull(message = "Plan ID is required")
            @Positive(message = "Plan ID must be positive")
            Long planId
    ) {}

    @PostMapping
    public ResponseEntity<CheckoutResponse> createCheckout(
            @Valid @RequestBody CheckoutRequest request,
            @AuthenticationPrincipal Jwt jwt) {

        CheckoutResponse response =
                checkoutService.createCheckout(
                        request.planId(),
                        jwt
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}
