
package com.brightloop.backend.repository;

import com.brightloop.backend.model.Tax;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TaxRepository extends JpaRepository<Tax, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<Tax> findByNameIgnoreCase(String name);
}
