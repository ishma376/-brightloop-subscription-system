
package com.brightloop.backend.repository;

import com.brightloop.backend.model.SubscriptionPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SubscriptionPlanRepository
        extends JpaRepository<SubscriptionPlan, Long> {

    boolean existsByNameIgnoreCase(String name);

    Optional<SubscriptionPlan> findByNameIgnoreCase(String name);
}

