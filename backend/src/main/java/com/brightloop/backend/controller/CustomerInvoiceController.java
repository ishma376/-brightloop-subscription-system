
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.InvoiceResponse;
import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.service.CustomerInvoiceService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import com.brightloop.backend.service.InvoicePdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;

import java.util.List;

@RestController
@RequestMapping("/api/customer/invoices")
public class CustomerInvoiceController {

    
private final CustomerInvoiceService customerInvoiceService;
private final InvoicePdfService invoicePdfService;


    
public CustomerInvoiceController(
        CustomerInvoiceService customerInvoiceService,
        InvoicePdfService invoicePdfService) {

    this.customerInvoiceService = customerInvoiceService;
    this.invoicePdfService = invoicePdfService;
}


    // GET ALL INVOICES BELONGING TO THE LOGGED-IN CUSTOMER
    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getMyInvoices(
            @AuthenticationPrincipal Jwt jwt) {

        List<InvoiceResponse> responses =
                customerInvoiceService.getMyInvoices(jwt)
                        .stream()
                        .map(InvoiceResponse::fromEntity)
                        .toList();

        return ResponseEntity.ok(responses);
    }

    // GET ONE INVOICE BELONGING TO THE LOGGED-IN CUSTOMER
    @GetMapping("/{id}")
    public ResponseEntity<InvoiceResponse> getMyInvoice(
            @PathVariable Long id,
            @AuthenticationPrincipal Jwt jwt) {

        Invoice invoice =
                customerInvoiceService.getMyInvoice(id, jwt);

        return ResponseEntity.ok(
                InvoiceResponse.fromEntity(invoice)
        );
    }
    
// DOWNLOAD OWN INVOICE AS PDF
@GetMapping(
    value = "/{id}/pdf",
    produces = MediaType.APPLICATION_PDF_VALUE
)
public ResponseEntity<byte[]> downloadMyInvoicePdf(
        @PathVariable Long id,
        @AuthenticationPrincipal Jwt jwt) {

    // Verify ownership before generating the PDF
    Invoice invoice = customerInvoiceService.getMyInvoice(id, jwt);

    byte[] pdf = invoicePdfService.generateInvoicePdf(invoice.getId());

    return ResponseEntity.ok()
            .contentType(MediaType.APPLICATION_PDF)
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"invoice-" + id + ".pdf\""
            )
            .body(pdf);
}

}
