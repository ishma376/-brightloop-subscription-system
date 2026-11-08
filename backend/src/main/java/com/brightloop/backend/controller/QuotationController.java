
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.QuotationRequest;
import com.brightloop.backend.dto.QuotationResponse;
import com.brightloop.backend.model.Quotation;
import com.brightloop.backend.service.QuotationService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotations")
public class QuotationController {

    private final QuotationService quotationService;

    public QuotationController(QuotationService quotationService) {
        this.quotationService = quotationService;
    }

    // CREATE QUOTATION
    @PostMapping
    public ResponseEntity<QuotationResponse> createQuotation(
            @Valid @RequestBody QuotationRequest request) {

        Quotation quotation =
                quotationService.createQuotation(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(QuotationResponse.fromEntity(quotation));
    }

    // GET ALL QUOTATIONS
    @GetMapping
    public ResponseEntity<List<QuotationResponse>> getAllQuotations() {

        List<QuotationResponse> responses =
                quotationService.getAllQuotations()
                        .stream()
                        .map(QuotationResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // GET QUOTATION BY ID
    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponse> getQuotationById(
            @PathVariable Long id) {

        Quotation quotation =
                quotationService.getQuotationById(id);

        return ResponseEntity.ok(
                QuotationResponse.fromEntity(quotation)
        );
    }

    // GET QUOTATIONS FOR A CUSTOMER
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<QuotationResponse>> getByCustomer(
            @PathVariable Long customerId) {

        List<QuotationResponse> responses =
                quotationService.getQuotationsByCustomer(customerId)
                        .stream()
                        .map(QuotationResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // UPDATE DRAFT QUOTATION
    @PutMapping("/{id}")
    public ResponseEntity<QuotationResponse> updateQuotation(
            @PathVariable Long id,
            @Valid @RequestBody QuotationRequest request) {

        Quotation quotation =
                quotationService.updateQuotation(id, request);

        return ResponseEntity.ok(
                QuotationResponse.fromEntity(quotation)
        );
    }
}
