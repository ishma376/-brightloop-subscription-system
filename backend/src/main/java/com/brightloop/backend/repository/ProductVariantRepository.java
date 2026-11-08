
package com.brightloop.backend.repository;

import com.brightloop.backend.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface ProductVariantRepository
        extends JpaRepository<ProductVariant, Long> {

    @EntityGraph(attributePaths = {"product"})
    List<ProductVariant> findByProductId(Long productId);
    
boolean existsByProductId(Long productId);

}
