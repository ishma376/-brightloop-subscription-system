
package com.brightloop.backend.service;

import com.brightloop.backend.dto.SubscriptionPlanRequest;
import com.brightloop.backend.model.Product;
import com.brightloop.backend.model.SubscriptionPlan;
import com.brightloop.backend.repository.ProductRepository;
import com.brightloop.backend.repository.SubscriptionPlanRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class SubscriptionPlanService {

    private final SubscriptionPlanRepository planRepository;
    private final ProductRepository productRepository;

    public SubscriptionPlanService(
            SubscriptionPlanRepository planRepository,
            ProductRepository productRepository) {

        this.planRepository = planRepository;
        this.productRepository = productRepository;
    }

    // CREATE SUBSCRIPTION PLAN
    @Transactional
    public SubscriptionPlan createPlan(
            SubscriptionPlanRequest request) {

        String name = request.getName().trim();

        if (planRepository.existsByNameIgnoreCase(name)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Subscription plan already exists"
            );
        }

        SubscriptionPlan plan = new SubscriptionPlan();

        if (request.getProductId() != null) {
            Product product = productRepository
                    .findById(request.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Selected product does not exist"
                    ));

            plan.setProduct(product);
        }

        plan.setName(name);
        plan.setBillingPeriod(request.getBillingPeriod());
        plan.setPrice(request.getPrice());
        plan.setMinimumQuantity(request.getMinimumQuantity());
        plan.setIsActive(request.getIsActive());
        plan.setAllowPause(request.getAllowPause());
        plan.setAllowEarlyClose(request.getAllowEarlyClose());
        plan.setAutoClose(request.getAutoClose());
        plan.setAutoRenew(request.getAutoRenew());

        try {
            return planRepository.saveAndFlush(plan);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Plan name already exists or violates a database constraint",
                    ex
            );
        }
    }

    // GET ALL SUBSCRIPTION PLANS
    @Transactional(readOnly = true)
    public List<SubscriptionPlan> getAllPlans() {
        return planRepository.findAll();
    }

    // GET SUBSCRIPTION PLAN BY ID
    @Transactional(readOnly = true)
    public SubscriptionPlan getPlanById(Long id) {

        return planRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Subscription plan not found"
                ));
    }

    // UPDATE SUBSCRIPTION PLAN
    @Transactional
    public SubscriptionPlan updatePlan(
            Long id,
            SubscriptionPlanRequest request) {

        SubscriptionPlan plan = planRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Subscription plan not found"
                ));

        String newName = request.getName().trim();

        planRepository.findByNameIgnoreCase(newName)
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new ResponseStatusException(
                                HttpStatus.CONFLICT,
                                "Another plan already uses this name"
                        );
                    }
                });

        if (request.getProductId() != null) {
            Product product = productRepository
                    .findById(request.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Selected product does not exist"
                    ));

            plan.setProduct(product);
        }

        plan.setName(newName);
        plan.setBillingPeriod(request.getBillingPeriod());
        plan.setPrice(request.getPrice());
        plan.setMinimumQuantity(request.getMinimumQuantity());
        plan.setIsActive(request.getIsActive());
        plan.setAllowPause(request.getAllowPause());
        plan.setAllowEarlyClose(request.getAllowEarlyClose());
        plan.setAutoClose(request.getAutoClose());
        plan.setAutoRenew(request.getAutoRenew());

        try {
            return planRepository.saveAndFlush(plan);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Plan update violates a database constraint",
                    ex
            );
        }
    }
    
@Transactional
public SubscriptionPlan activatePlan(Long id) {

    SubscriptionPlan plan = planRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Subscription plan not found"
            ));

    plan.setIsActive(true);

    return planRepository.save(plan);
}

@Transactional
public SubscriptionPlan deactivatePlan(Long id) {

    SubscriptionPlan plan = planRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Subscription plan not found"
            ));

    plan.setIsActive(false);

    return planRepository.save(plan);
}

}

