
package com.brightloop.backend.service;

import com.brightloop.backend.dto.ProductVariantRequest;
import com.brightloop.backend.model.Product;
import com.brightloop.backend.model.ProductVariant;
import com.brightloop.backend.repository.ProductRepository;
import com.brightloop.backend.repository.ProductVariantRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public ProductVariantService(
            ProductRepository productRepository,
            ProductVariantRepository variantRepository) {

        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @Transactional
    public ProductVariant createVariant(
            Long productId,
            ProductVariantRequest request) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));

        BigDecimal finalPrice = product.getSalesPrice()
                .add(request.getPriceAdjustment());

        if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Final product price cannot be negative"
            );
        }

        ProductVariant variant = new ProductVariant(
                product,
                request.getName().trim(),
                request.getPriceAdjustment()
        );

        try {
            return variantRepository.saveAndFlush(variant);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Variant already exists or violates a database constraint",
                    ex
            );
        }
    }

    @Transactional(readOnly = true)
    public List<ProductVariant> getVariantsByProduct(Long productId) {

        if (!productRepository.existsById(productId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
            );
        }

        return variantRepository.findByProductId(productId);
    }
}

