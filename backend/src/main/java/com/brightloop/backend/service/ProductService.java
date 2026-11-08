
package com.brightloop.backend.service;

import com.brightloop.backend.dto.ProductRequest;
import com.brightloop.backend.model.Product;
import com.brightloop.backend.repository.ProductRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.brightloop.backend.repository.ProductVariantRepository;


import java.util.List;

@Service
public class ProductService {

    
private final ProductRepository productRepository;
private final ProductVariantRepository variantRepository;

public ProductService(
        ProductRepository productRepository,
        ProductVariantRepository variantRepository) {

    this.productRepository = productRepository;
    this.variantRepository = variantRepository;
}


    @Transactional
    public Product createProduct(ProductRequest request) {

        Product product = new Product(
                request.getName().trim(),
                request.getType().trim(),
                request.getSalesPrice(),
                request.getCostPrice(),
                request.getNotes()
        );

        return productRepository.save(product);
    }

    @Transactional(readOnly = true)
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Product getProductById(Long id) {

        return productRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found"
                ));
    }
    
@Transactional
public Product updateProduct(
        Long id,
        ProductRequest request) {

    Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
            ));

    product.setName(request.getName().trim());
    product.setType(request.getType().trim());
    product.setSalesPrice(request.getSalesPrice());
    product.setCostPrice(request.getCostPrice());
    product.setNotes(request.getNotes());

    return productRepository.save(product);
}


@Transactional
public void deleteProduct(Long id) {

    Product product = productRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Product not found"
            ));

    if (variantRepository.existsByProductId(id)) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Cannot delete a product that has variants"
        );
    }

    try {
        productRepository.delete(product);
        productRepository.flush();
    } catch (org.springframework.dao.DataIntegrityViolationException ex) {
        throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Cannot delete a product referenced by other records",
                ex
        );
    }
}


}
