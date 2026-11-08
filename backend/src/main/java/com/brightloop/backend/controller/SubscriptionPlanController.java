
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.SubscriptionPlanRequest;
import com.brightloop.backend.model.SubscriptionPlan;
import com.brightloop.backend.service.SubscriptionPlanService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plans")
public class SubscriptionPlanController {

    private final SubscriptionPlanService planService;

    public SubscriptionPlanController(
            SubscriptionPlanService planService) {
        this.planService = planService;
    }

    @PostMapping
    public ResponseEntity<SubscriptionPlan> createPlan(
            @Valid @RequestBody SubscriptionPlanRequest request) {

        SubscriptionPlan plan = planService.createPlan(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(plan);
    }

    @GetMapping
    public ResponseEntity<List<SubscriptionPlan>> getAllPlans() {

        return ResponseEntity.ok(planService.getAllPlans());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionPlan> getPlanById(
            @PathVariable Long id) {

        return ResponseEntity.ok(planService.getPlanById(id));
    }
    
@PutMapping("/{id}")
public ResponseEntity<SubscriptionPlan> updatePlan(
        @PathVariable Long id,
        @Valid @RequestBody SubscriptionPlanRequest request) {

    SubscriptionPlan updatedPlan =
            planService.updatePlan(id, request);

    return ResponseEntity.ok(updatedPlan);
}

@PatchMapping("/{id}/activate")
public ResponseEntity<SubscriptionPlan> activatePlan(
        @PathVariable Long id) {

    SubscriptionPlan plan = planService.activatePlan(id);

    return ResponseEntity.ok(plan);
}

@PatchMapping("/{id}/deactivate")
public ResponseEntity<SubscriptionPlan> deactivatePlan(
        @PathVariable Long id) {

    SubscriptionPlan plan = planService.deactivatePlan(id);

    return ResponseEntity.ok(plan);
}


}

