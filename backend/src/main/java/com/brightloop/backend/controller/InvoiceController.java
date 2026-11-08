
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.InvoiceRequest;
import com.brightloop.backend.dto.InvoiceResponse;

import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;

import com.brightloop.backend.service.InvoiceService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.brightloop.backend.service.InvoicePdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {


    private final InvoiceService invoiceService;
    private final InvoicePdfService invoicePdfService;


    
    public InvoiceController(
            InvoiceService invoiceService,
            InvoicePdfService invoicePdfService) {

        this.invoiceService = invoiceService;
        this.invoicePdfService = invoicePdfService;
    }


    // GENERATE INVOICE
    @PostMapping
    public ResponseEntity<InvoiceResponse> generateInvoice(
            @Valid @RequestBody InvoiceRequest request) {

        Invoice invoice = invoiceService.generateInvoice(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(InvoiceResponse.fromEntity(invoice));
    }

    // GET ALL INVOICES
    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {

        List<InvoiceResponse> responses =
                invoiceService.getAllInvoices()
                        .stream()
                        .map(InvoiceResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // GET INVOICES BY CUSTOMER
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<InvoiceResponse>> getByCustomer(
            @PathVariable Long customerId) {

        List<InvoiceResponse> responses =
                invoiceService.getInvoicesByCustomer(customerId)
                        .stream()
                        .map(InvoiceResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // GET INVOICES BY SUBSCRIPTION
    @GetMapping("/subscription/{subscriptionId}")
    public ResponseEntity<List<InvoiceResponse>> getBySubscription(
            @PathVariable Long subscriptionId) {

        List<InvoiceResponse> responses =
                invoiceService.getInvoicesBySubscription(subscriptionId)
                        .stream()
                        .map(InvoiceResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // GET INVOICES BY STATUS
    @GetMapping("/status/{status}")
    public ResponseEntity<List<InvoiceResponse>> getByStatus(
            @PathVariable InvoiceStatus status) {

        List<InvoiceResponse> responses =
                invoiceService.getInvoicesByStatus(status)
                        .stream()
                        .map(InvoiceResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // GET INVOICE BY ID
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getInvoiceById(
            @PathVariable Long id) {

        Invoice invoice = invoiceService.getInvoiceById(id);

        return ResponseEntity.ok(
                InvoiceResponse.fromEntity(invoice)
        );
    }
    
    // ISSUE INVOICE
    @PatchMapping("/{id}/issue")
    public ResponseEntity<InvoiceResponse> issueInvoice(
            @PathVariable Long id) {

        Invoice invoice = invoiceService.issueInvoice(id);

        return ResponseEntity.ok(
                InvoiceResponse.fromEntity(invoice)
        );
    }
    
    // DOWNLOAD INVOICE AS PDF
    @GetMapping(
        value = "/{id}/pdf",
        produces = MediaType.APPLICATION_PDF_VALUE
    )
    public ResponseEntity<byte[]> downloadInvoicePdf(
            @PathVariable Long id) {

        byte[] pdf = invoicePdfService.generateInvoicePdf(id);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(
                    HttpHeaders.CONTENT_DISPOSITION,
                    "attachment; filename=\"invoice-" + id + ".pdf\""
                )
                .body(pdf);
    }


}
