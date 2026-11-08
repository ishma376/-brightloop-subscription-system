
package com.brightloop.backend.service;

import com.brightloop.backend.dto.DiscountRequest;
import com.brightloop.backend.model.Discount;
import com.brightloop.backend.model.DiscountType;
import com.brightloop.backend.repository.DiscountRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DiscountService {

    private final DiscountRepository discountRepository;

    public DiscountService(DiscountRepository discountRepository) {
        this.discountRepository = discountRepository;
    }

    // CREATE DISCOUNT
    @Transactional
    public Discount createDiscount(DiscountRequest request) {

        String name = validateAndGetName(request);

        if (discountRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Discount with this name already exists"
            );
        }

        Discount discount = new Discount();

        discount.setName(name);
        discount.setDiscountType(request.getDiscountType());
        discount.setValue(request.getValue());
        discount.setIsActive(request.getIsActive());

        try {
            return discountRepository.saveAndFlush(discount);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Discount violates a database constraint",
                ex
            );
        }
    }

    // GET ALL DISCOUNTS
    @Transactional(readOnly = true)
    public List<Discount> getAllDiscounts() {
        return discountRepository.findAll();
    }

    // GET DISCOUNT BY ID
    @Transactional(readOnly = true)
    public Discount getDiscountById(Long id) {
        return discountRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Discount not found"
            ));
    }

    // UPDATE DISCOUNT
    @Transactional
    public Discount updateDiscount(
            Long id,
            DiscountRequest request) {

        Discount discount = getDiscountById(id);
        String name = validateAndGetName(request);

        discountRepository.findByNameIgnoreCase(name)
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Another discount already uses this name"
                    );
                }
            });

        discount.setName(name);
        discount.setDiscountType(request.getDiscountType());
        discount.setValue(request.getValue());
        discount.setIsActive(request.getIsActive());

        try {
            return discountRepository.saveAndFlush(discount);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Discount update violates a database constraint",
                ex
            );
        }
    }

    // VALIDATE DISCOUNT DETAILS
    private String validateAndGetName(DiscountRequest request) {

        if (request.getName() == null ||
                request.getName().trim().isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Discount name is required"
            );
        }

        if (request.getDiscountType() == null ||
                request.getValue() == null ||
                request.getIsActive() == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Discount type, value and active status are required"
            );
        }

        if (request.getValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Discount value must be greater than zero"
            );
        }

        if (request.getDiscountType() == DiscountType.PERCENTAGE &&
                request.getValue().compareTo(
                    new BigDecimal("100.00")) > 0) {

            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Percentage discount cannot exceed 100%"
            );
        }

        return request.getName().trim();
    }
}
