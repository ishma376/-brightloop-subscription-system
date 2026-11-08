
package com.brightloop.backend.repository;

import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.brightloop.backend.model.InvoiceStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface InvoiceRepository
        extends JpaRepository<Invoice, Long> {

    // GET ALL INVOICES
    @Override
    @EntityGraph(attributePaths = {"customer", "subscription"})
    List<Invoice> findAll();

    // GET INVOICE BY ID
    @Override
    @EntityGraph(attributePaths = {"customer", "subscription"})
    Optional<Invoice> findById(Long id);

    // FIND INVOICE BY INVOICE NUMBER
    @EntityGraph(attributePaths = {"customer", "subscription"})
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    // GET INVOICES FOR A CUSTOMER
    @EntityGraph(attributePaths = {"customer", "subscription"})
    List<Invoice> findByCustomerId(Long customerId);

    // GET INVOICES FOR A SUBSCRIPTION
    @EntityGraph(attributePaths = {"customer", "subscription"})
    List<Invoice> findBySubscriptionId(Long subscriptionId);

    // GET INVOICES BY STATUS
    @EntityGraph(attributePaths = {"customer", "subscription"})
    List<Invoice> findByStatus(InvoiceStatus status);

    // CHECK FOR AN EXISTING INVOICE FOR A BILLING PERIOD
    boolean existsBySubscriptionIdAndBillingPeriodStart(
            Long subscriptionId,
            LocalDate billingPeriodStart
    );
    
    // FIND AN INVOICE BELONGING TO A SPECIFIC CUSTOMER
    @EntityGraph(attributePaths = {"customer", "subscription"})
    Optional<Invoice> findByIdAndCustomerId(
            Long invoiceId,
            Long customerId
    );
    
@Query("""
    SELECT i
    FROM Invoice i
    WHERE i.dueDate < :today
      AND i.balanceDue > 0
      AND i.status IN :statuses
    ORDER BY i.dueDate ASC
    """)
List<Invoice> findOverdueCandidates(
        @Param("today") LocalDate today,
        @Param("statuses") Collection<InvoiceStatus> statuses
);

@Query("""
    SELECT i
    FROM Invoice i
    WHERE i.status = :status
      AND i.balanceDue > 0
    ORDER BY i.dueDate ASC
    """)
List<Invoice> findInvoicesByStatusWithBalance(
        @Param("status") InvoiceStatus status
);


}
