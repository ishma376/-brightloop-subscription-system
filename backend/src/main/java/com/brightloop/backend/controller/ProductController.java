
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.ProductRequest;
import com.brightloop.backend.model.Product;
import com.brightloop.backend.service.ProductService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(
            @Valid @RequestBody ProductRequest request) {

        Product product = productService.createProduct(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(product);
    }

    @GetMapping
    public ResponseEntity<List<Product>> getAllProducts() {

        return ResponseEntity.ok(
                productService.getAllProducts()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                productService.getProductById(id)
        );
    }
    
@PutMapping("/{id}")
public ResponseEntity<Product> updateProduct(
        @PathVariable Long id,
        @Valid @RequestBody ProductRequest request) {

    Product updatedProduct =
            productService.updateProduct(id, request);

    return ResponseEntity.ok(updatedProduct);
}

@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteProduct(
        @PathVariable Long id) {

    productService.deleteProduct(id);

    return ResponseEntity.noContent().build();
}


}

