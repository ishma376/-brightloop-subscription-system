
package com.brightloop.backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class FinancialDashboardService {

    private final JdbcTemplate jdbcTemplate;

    public FinancialDashboardService(
            JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboardSummary() {

        LocalDate today = LocalDate.now(
                ZoneId.of("Asia/Kolkata")
        );

        // Exclude draft and cancelled invoices.
        BigDecimal totalInvoiced = getAmount("""
            SELECT COALESCE(SUM(total_amount), 0)
            FROM invoices
            WHERE status NOT IN ('DRAFT', 'CANCELLED')
            """);

        // Money actually recorded in the payments table.
        BigDecimal paymentsCollected = getAmount("""
            SELECT COALESCE(SUM(amount), 0)
            FROM payments
            """);

        // Outstanding amounts on issued invoices.
        BigDecimal outstandingBalance = getAmount("""
            SELECT COALESCE(SUM(balance_due), 0)
            FROM invoices
            WHERE status NOT IN ('DRAFT', 'CANCELLED')
            """);

        // Calculate overdue balances using due dates,
        // even if the scheduled status refresh has not run.
        BigDecimal overdueAmount = jdbcTemplate.queryForObject("""
            SELECT COALESCE(SUM(balance_due), 0)
            FROM invoices
            WHERE due_date < ?
              AND balance_due > 0
              AND status NOT IN ('DRAFT', 'CANCELLED', 'PAID')
            """,
            BigDecimal.class,
            today
        );

        Long totalInvoices = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM invoices
            WHERE status NOT IN ('DRAFT', 'CANCELLED')
            """, Long.class);

        Long paidInvoices = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM invoices
            WHERE status = 'PAID'
            """, Long.class);

        Long overdueInvoices = jdbcTemplate.queryForObject("""
            SELECT COUNT(*)
            FROM invoices
            WHERE due_date < ?
              AND balance_due > 0
              AND status NOT IN ('DRAFT', 'CANCELLED', 'PAID')
            """,
            Long.class,
            today
        );

        Map<String, Object> summary = new LinkedHashMap<>();

        summary.put("totalInvoiced", totalInvoiced);
        summary.put("paymentsCollected", paymentsCollected);
        summary.put("outstandingBalance", outstandingBalance);
        summary.put("overdueAmount", overdueAmount);
        summary.put("totalInvoices", totalInvoices);
        summary.put("paidInvoices", paidInvoices);
        summary.put("overdueInvoices", overdueInvoices);
        summary.put("asOfDate", today);

        return summary;
    }

    private BigDecimal getAmount(String sql) {

        return jdbcTemplate.queryForObject(
                sql,
                BigDecimal.class
        );
    }
}
