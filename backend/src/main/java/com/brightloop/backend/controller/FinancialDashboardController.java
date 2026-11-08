
package com.brightloop.backend.controller;

import com.brightloop.backend.service.FinancialDashboardService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class FinancialDashboardController {

    private final FinancialDashboardService dashboardService;

    public FinancialDashboardController(
            FinancialDashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/financial")
    public ResponseEntity<Map<String, Object>>
            getFinancialDashboard() {

        Map<String, Object> summary =
                dashboardService.getDashboardSummary();

        return ResponseEntity.ok(summary);
    }
}
