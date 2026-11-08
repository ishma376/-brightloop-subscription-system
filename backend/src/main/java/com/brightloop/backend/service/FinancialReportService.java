
package com.brightloop.backend.service;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class FinancialReportService {

    private final JdbcTemplate jdbcTemplate;

    public FinancialReportService(
            JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional(readOnly = true)
    public List<MonthlyCollectionResponse>
            getMonthlyCollections() {

        String sql = """
            SELECT
                DATE_TRUNC('month', payment_date)
                    ::date AS month,
                COUNT(*) AS payment_count,
                COALESCE(SUM(amount), 0)
                    AS total_collected
            FROM payments
            GROUP BY DATE_TRUNC('month', payment_date)
            ORDER BY month DESC
            """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new MonthlyCollectionResponse(
                        rs.getObject(
                                "month",
                                LocalDate.class
                        ),
                        rs.getLong("payment_count"),
                        rs.getBigDecimal("total_collected")
                )
        );
    }

    public record MonthlyCollectionResponse(
            LocalDate month,
            long paymentCount,
            BigDecimal totalCollected
    ) {}
    
@Transactional(readOnly = true)
public List<OutstandingInvoiceResponse>
        getOutstandingInvoices() {

    String sql = """
        SELECT
            i.id,
            i.invoice_number,
            c.name AS customer_name,
            i.status,
            i.due_date,
            i.total_amount,
            i.amount_paid,
            i.balance_due
        FROM invoices i
        JOIN customers c ON i.customer_id = c.id
        WHERE i.balance_due > 0
          AND i.status NOT IN ('DRAFT', 'CANCELLED', 'PAID')
        ORDER BY i.due_date ASC, i.id ASC
        """;

    return jdbcTemplate.query(sql, (rs, rowNum) ->
        new OutstandingInvoiceResponse(
            rs.getLong("id"),
            rs.getString("invoice_number"),
            rs.getString("customer_name"),
            rs.getString("status"),
            rs.getObject("due_date", LocalDate.class),
            rs.getBigDecimal("total_amount"),
            rs.getBigDecimal("amount_paid"),
            rs.getBigDecimal("balance_due")
        )
    );
}

public record OutstandingInvoiceResponse(
        Long invoiceId,
        String invoiceNumber,
        String customerName,
        String status,
        LocalDate dueDate,
        BigDecimal totalAmount,
        BigDecimal amountPaid,
        BigDecimal balanceDue
) {}

@Transactional(readOnly = true)
public List<PaymentMethodResponse> getPaymentMethodReport() {

    String sql = """
        SELECT
            payment_method,
            COUNT(*) AS payment_count,
            COALESCE(SUM(amount), 0) AS total_collected
        FROM payments
        GROUP BY payment_method
        ORDER BY total_collected DESC
        """;

    return jdbcTemplate.query(sql, (rs, rowNum) ->
        new PaymentMethodResponse(
            rs.getString("payment_method"),
            rs.getLong("payment_count"),
            rs.getBigDecimal("total_collected")
        )
    );
}

public record PaymentMethodResponse(
        String paymentMethod,
        long paymentCount,
        BigDecimal totalCollected
) {}


}
