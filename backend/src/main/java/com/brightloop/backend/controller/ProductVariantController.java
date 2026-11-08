
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.ProductVariantRequest;
import com.brightloop.backend.dto.ProductVariantResponse;
import com.brightloop.backend.model.ProductVariant;
import com.brightloop.backend.service.ProductVariantService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/variants")
public class ProductVariantController {

    private final ProductVariantService variantService;

    public ProductVariantController(
            ProductVariantService variantService) {
        this.variantService = variantService;
    }

    @PostMapping
    public ResponseEntity<ProductVariantResponse> createVariant(
            @PathVariable Long productId,
            @Valid @RequestBody ProductVariantRequest request) {

        ProductVariant variant =
                variantService.createVariant(productId, request);

        ProductVariantResponse response =
                new ProductVariantResponse(variant);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProductVariantResponse>> getVariants(
            @PathVariable Long productId) {

        List<ProductVariantResponse> response =
                variantService.getVariantsByProduct(productId)
                        .stream()
                        .map(ProductVariantResponse::new)
                        .toList();

        return ResponseEntity.ok(response);
    }
}

