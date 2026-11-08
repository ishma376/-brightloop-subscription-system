
package com.brightloop.backend.service;

import com.brightloop.backend.dto.TaxRequest;
import com.brightloop.backend.model.Tax;
import com.brightloop.backend.repository.TaxRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class TaxService {

    private final TaxRepository taxRepository;

    public TaxService(TaxRepository taxRepository) {
        this.taxRepository = taxRepository;
    }

    // CREATE TAX
    @Transactional
    public Tax createTax(TaxRequest request) {

        String name = request.getName().trim();

        if (taxRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tax with this name already exists"
            );
        }

        Tax tax = new Tax();

        tax.setName(name);
        tax.setRate(request.getRate());
        tax.setIsActive(request.getIsActive());

        try {
            return taxRepository.saveAndFlush(tax);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tax name already exists or violates a database constraint",
                    ex
            );
        }
    }

    // GET ALL TAXES
    @Transactional(readOnly = true)
    public List<Tax> getAllTaxes() {
        return taxRepository.findAll();
    }

    // GET TAX BY ID
    @Transactional(readOnly = true)
    public Tax getTaxById(Long id) {
        return taxRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tax not found"
                ));
    }

    // UPDATE TAX
    @Transactional
    public Tax updateTax(Long id, TaxRequest request) {

        Tax tax = taxRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Tax not found"
                ));

        String name = request.getName().trim();

        taxRepository.findByNameIgnoreCase(name)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Another tax already uses this name"
                        );
                    }
                });

        tax.setName(name);
        tax.setRate(request.getRate());
        tax.setIsActive(request.getIsActive());

        try {
            return taxRepository.saveAndFlush(tax);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tax update violates a database constraint",
                    ex
            );
        }
    }
}

