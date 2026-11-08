
package com.brightloop.backend.repository;

import com.brightloop.backend.model.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QuotationRepository
        extends JpaRepository<Quotation, Long> {

    boolean existsByQuotationNumber(String quotationNumber);

    Optional<Quotation> findByQuotationNumber(
            String quotationNumber
    );

    List<Quotation> findByCustomerId(Long customerId);
}
