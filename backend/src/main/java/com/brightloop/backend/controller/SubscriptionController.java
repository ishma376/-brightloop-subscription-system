
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.SubscriptionRequest;
import com.brightloop.backend.dto.SubscriptionResponse;
import com.brightloop.backend.model.Subscription;
import com.brightloop.backend.model.SubscriptionStatus;
import com.brightloop.backend.service.SubscriptionService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    public SubscriptionController(
            SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    // CREATE SUBSCRIPTION
    @PostMapping
    public ResponseEntity<SubscriptionResponse> createSubscription(
            @Valid @RequestBody SubscriptionRequest request) {

        Subscription subscription =
                subscriptionService.createSubscription(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(SubscriptionResponse.fromEntity(subscription));
    }

    // GET ALL SUBSCRIPTIONS
    @GetMapping
    public ResponseEntity<List<SubscriptionResponse>>
            getAllSubscriptions() {

        List<SubscriptionResponse> responses =
                subscriptionService.getAllSubscriptions()
                        .stream()
                        .map(SubscriptionResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // GET SUBSCRIPTION BY ID
    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponse>
            getSubscriptionById(@PathVariable Long id) {

        Subscription subscription =
                subscriptionService.getSubscriptionById(id);

        return ResponseEntity.ok(
                SubscriptionResponse.fromEntity(subscription)
        );
    }

    // GET SUBSCRIPTIONS BY CUSTOMER
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<SubscriptionResponse>>
            getSubscriptionsByCustomer(
                    @PathVariable Long customerId) {

        List<SubscriptionResponse> responses =
                subscriptionService
                        .getSubscriptionsByCustomer(customerId)
                        .stream()
                        .map(SubscriptionResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // GET SUBSCRIPTIONS BY STATUS
    @GetMapping("/status/{status}")
    public ResponseEntity<List<SubscriptionResponse>>
            getSubscriptionsByStatus(
                    @PathVariable SubscriptionStatus status) {

        List<SubscriptionResponse> responses =
                subscriptionService.getSubscriptionsByStatus(status)
                        .stream()
                        .map(SubscriptionResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }
    
    // CONFIRM SUBSCRIPTION
    @PatchMapping("/{id}/confirm")
    public ResponseEntity<SubscriptionResponse> confirmSubscription(
            @PathVariable Long id) {

        Subscription subscription =
                subscriptionService.confirmSubscription(id);

        return ResponseEntity.ok(
                SubscriptionResponse.fromEntity(subscription)
        );
    }
    
    // ACTIVATE SUBSCRIPTION
    
    // ACTIVATE SUBSCRIPTION
    @PatchMapping("/{id}/activate")
    public ResponseEntity<SubscriptionResponse> activateSubscription(
            @PathVariable Long id) {

        Subscription subscription =
                subscriptionService.activateSubscription(id);

        return ResponseEntity.ok(
                SubscriptionResponse.fromEntity(subscription)
        );
    }
    
    // PAUSE SUBSCRIPTION
    @PatchMapping("/{id}/pause")
    public ResponseEntity<SubscriptionResponse> pauseSubscription(
            @PathVariable Long id) {

        Subscription subscription =
                subscriptionService.pauseSubscription(id);

        return ResponseEntity.ok(
                SubscriptionResponse.fromEntity(subscription)
        );
    }
    
    // RESUME SUBSCRIPTION
    @PatchMapping("/{id}/resume")
    public ResponseEntity<SubscriptionResponse> resumeSubscription(
            @PathVariable Long id) {

        Subscription subscription =
                subscriptionService.resumeSubscription(id);

        return ResponseEntity.ok(
                SubscriptionResponse.fromEntity(subscription)
        );
    }
    
    // CLOSE SUBSCRIPTION
    @PatchMapping("/{id}/close")
    public ResponseEntity<SubscriptionResponse> closeSubscription(
            @PathVariable Long id) {

        Subscription subscription =
                subscriptionService.closeSubscription(id);

        return ResponseEntity.ok(
                SubscriptionResponse.fromEntity(subscription)
        );
    }






}
