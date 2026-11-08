
package com.brightloop.backend.repository;

import com.brightloop.backend.model.Discount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DiscountRepository extends JpaRepository<Discount, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Discount> findByNameIgnoreCase(String name);

}
