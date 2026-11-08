
package com.brightloop.backend.repository;

import com.brightloop.backend.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository
        extends JpaRepository<Product, Long> {
}

