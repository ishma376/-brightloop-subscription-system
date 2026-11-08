
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.TaxRequest;
import com.brightloop.backend.model.Tax;
import com.brightloop.backend.service.TaxService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/taxes")
public class TaxController {

    private final TaxService taxService;

    public TaxController(TaxService taxService) {
        this.taxService = taxService;
    }

    // CREATE TAX
    @PostMapping
    public ResponseEntity<Tax> createTax(
            @Valid @RequestBody TaxRequest request) {

        Tax tax = taxService.createTax(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tax);
    }

    // GET ALL TAXES
    @GetMapping
    public ResponseEntity<List<Tax>> getAllTaxes() {

        return ResponseEntity.ok(taxService.getAllTaxes());
    }

    // GET TAX BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Tax> getTaxById(
            @PathVariable Long id) {

        return ResponseEntity.ok(taxService.getTaxById(id));
    }

    // UPDATE TAX
    @PutMapping("/{id}")
    public ResponseEntity<Tax> updateTax(
            @PathVariable Long id,
            @Valid @RequestBody TaxRequest request) {

        Tax updatedTax = taxService.updateTax(id, request);

        return ResponseEntity.ok(updatedTax);
    }
}
