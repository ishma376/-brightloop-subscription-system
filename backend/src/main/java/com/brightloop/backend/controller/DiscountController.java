
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.DiscountRequest;
import com.brightloop.backend.model.Discount;
import com.brightloop.backend.service.DiscountService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/discounts")
public class DiscountController {

    private final DiscountService discountService;

    public DiscountController(DiscountService discountService) {
        this.discountService = discountService;
    }

    // CREATE DISCOUNT
    @PostMapping
    public ResponseEntity<Discount> createDiscount(
            @Valid @RequestBody DiscountRequest request) {

        Discount discount = discountService.createDiscount(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(discount);
    }

    // GET ALL DISCOUNTS
    @GetMapping
    public ResponseEntity<List<Discount>> getAllDiscounts() {

        return ResponseEntity.ok(
                discountService.getAllDiscounts()
        );
    }

    // GET DISCOUNT BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Discount> getDiscountById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                discountService.getDiscountById(id)
        );
    }

    // UPDATE DISCOUNT
    @PutMapping("/{id}")
    public ResponseEntity<Discount> updateDiscount(
            @PathVariable Long id,
            @Valid @RequestBody DiscountRequest request) {

        Discount updatedDiscount =
                discountService.updateDiscount(id, request);

        return ResponseEntity.ok(updatedDiscount);
    }
}
