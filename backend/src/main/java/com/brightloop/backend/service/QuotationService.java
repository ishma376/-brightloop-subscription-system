
package com.brightloop.backend.service;

import com.brightloop.backend.dto.QuotationRequest;
import com.brightloop.backend.model.Customer;
import com.brightloop.backend.model.Quotation;
import com.brightloop.backend.model.QuotationStatus;
import com.brightloop.backend.repository.CustomerRepository;
import com.brightloop.backend.repository.QuotationRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;

    public QuotationService(
            QuotationRepository quotationRepository,
            CustomerRepository customerRepository) {

        this.quotationRepository = quotationRepository;
        this.customerRepository = customerRepository;
    }

    // CREATE QUOTATION
    @Transactional
    public Quotation createQuotation(QuotationRequest request) {

        Customer customer = getActiveCustomer(
                request.getCustomerId()
        );

        LocalDate today = LocalDate.now();

        if (request.getValidUntil() != null &&
                request.getValidUntil().isBefore(today)) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Validity date cannot be in the past"
            );
        }

        Quotation quotation = new Quotation();

        quotation.setQuotationNumber(
                "QT-" + UUID.randomUUID()
                        .toString()
                        .toUpperCase()
        );

        quotation.setCustomer(customer);
        quotation.setStatus(QuotationStatus.DRAFT);
        quotation.setQuotationDate(today);
        quotation.setValidUntil(request.getValidUntil());
        quotation.setNotes(request.getNotes());

        return quotationRepository.saveAndFlush(quotation);
    }

    // GET ALL QUOTATIONS
    @Transactional(readOnly = true)
    public List<Quotation> getAllQuotations() {
        return quotationRepository.findAll();
    }

    // GET QUOTATION BY ID
    @Transactional(readOnly = true)
    public Quotation getQuotationById(Long id) {

        return quotationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Quotation not found"
                ));
    }

    // GET QUOTATIONS BY CUSTOMER
    @Transactional(readOnly = true)
    public List<Quotation> getQuotationsByCustomer(Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Customer not found"
            );
        }

        return quotationRepository.findByCustomerId(customerId);
    }

    // UPDATE DRAFT QUOTATION
    @Transactional
    public Quotation updateQuotation(
            Long id,
            QuotationRequest request) {

        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Quotation not found"
                ));

        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Only DRAFT quotations can be updated"
            );
        }

        Customer customer = getActiveCustomer(
                request.getCustomerId()
        );

        LocalDate quotationDate = quotation.getQuotationDate();

        if (request.getValidUntil() != null &&
                request.getValidUntil().isBefore(quotationDate)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Validity date cannot be before quotation date"
            );
        }

        quotation.setCustomer(customer);
        quotation.setValidUntil(request.getValidUntil());
        quotation.setNotes(request.getNotes());

        return quotationRepository.saveAndFlush(quotation);
    }

    // CHECK CUSTOMER
    private Customer getActiveCustomer(Long customerId) {

        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"
                ));

        if (!Boolean.TRUE.equals(customer.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot create quotations for inactive customers"
            );
        }

        return customer;
    }
}
