
package com.brightloop.backend.repository;

import com.brightloop.backend.model.Subscription;
import com.brightloop.backend.model.SubscriptionStatus;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubscriptionRepository
        extends JpaRepository<Subscription, Long> {

    // GET ALL SUBSCRIPTIONS
    @Override
    @EntityGraph(attributePaths = {"customer", "plan", "quotation"})
    List<Subscription> findAll();

    // GET SUBSCRIPTION BY ID
    @Override
    @EntityGraph(attributePaths = {"customer", "plan", "quotation"})
    Optional<Subscription> findById(Long id);

    // GET SUBSCRIPTIONS BY CUSTOMER
    @EntityGraph(attributePaths = {"customer", "plan", "quotation"})
    List<Subscription> findByCustomerId(Long customerId);

    // GET SUBSCRIPTIONS BY STATUS
    @EntityGraph(attributePaths = {"customer", "plan", "quotation"})
    List<Subscription> findByStatus(SubscriptionStatus status);

    // CHECK WHETHER A QUOTATION ALREADY HAS A SUBSCRIPTION
    boolean existsByQuotationId(Long quotationId);
}
