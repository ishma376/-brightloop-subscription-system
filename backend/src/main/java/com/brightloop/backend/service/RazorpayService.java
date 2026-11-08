
package com.brightloop.backend.service;

import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;
import com.brightloop.backend.model.RazorpayOrder;

import com.brightloop.backend.repository.InvoiceRepository;
import com.brightloop.backend.repository.RazorpayOrderRepository;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class RazorpayService {

    private final InvoiceRepository invoiceRepository;
    private final RazorpayOrderRepository razorpayOrderRepository;
    private final EntityManager entityManager;

    private final RazorpayClient razorpayClient;
    private final String keyId;

    public RazorpayService(
            InvoiceRepository invoiceRepository,
            RazorpayOrderRepository razorpayOrderRepository,
            EntityManager entityManager,
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret
    ) throws RazorpayException {

        this.invoiceRepository = invoiceRepository;
        this.razorpayOrderRepository = razorpayOrderRepository;
        this.entityManager = entityManager;
        this.keyId = keyId;

        this.razorpayClient = new RazorpayClient(
                keyId,
                keySecret
        );
    }

    @Transactional
    public Map<String, Object> createOrder(
            Long invoiceId,
            BigDecimal requestedAmount) {

        Invoice invoice = entityManager.find(
                Invoice.class,
                invoiceId,
                LockModeType.PESSIMISTIC_WRITE
        );

        if (invoice == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Invoice not found"
            );
        }

        InvoiceStatus status = invoice.getStatus();

        if (status != InvoiceStatus.ISSUED
                && status != InvoiceStatus.PARTIALLY_PAID
                && status != InvoiceStatus.OVERDUE) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice is not eligible for payment"
            );
        }

        BigDecimal balance = invoice.getBalanceDue();

        if (balance == null
                || balance.compareTo(BigDecimal.ZERO) <= 0) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Invoice has no outstanding balance"
            );
        }

        BigDecimal amount = requestedAmount == null
                ? balance
                : requestedAmount;

        if (amount.compareTo(BigDecimal.ZERO) <= 0
                || amount.scale() > 2
                || amount.precision() - amount.scale() > 10) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Enter a valid positive payment amount"
            );
        }

        if (amount.compareTo(balance) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Payment exceeds the outstanding balance"
            );
        }

        long amountInPaise;

        try {
            amountInPaise = amount
                    .movePointRight(2)
                    .longValueExact();
        } catch (ArithmeticException ex) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid payment amount",
                    ex
            );
        }

        if (amountInPaise < 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Minimum Razorpay payment is ₹1"
            );
        }

        try {
            JSONObject orderRequest = new JSONObject();

            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put(
                    "receipt",
                    "BL-" + invoice.getId() + "-"
                            + System.currentTimeMillis()
            );

            Order razorpayOrder =
                    razorpayClient.orders.create(orderRequest);

            String razorpayOrderId = razorpayOrder.get("id");

            RazorpayOrder savedOrder = new RazorpayOrder();

            savedOrder.setInvoice(invoice);
            savedOrder.setRazorpayOrderId(razorpayOrderId);
            savedOrder.setAmountPaise(amountInPaise);
            savedOrder.setCurrency("INR");
            savedOrder.setStatus("CREATED");

            razorpayOrderRepository.saveAndFlush(savedOrder);

            Map<String, Object> response = new HashMap<>();

            response.put("orderId", razorpayOrderId);
            response.put("invoiceId", invoice.getId());
            response.put("amount", amountInPaise);
            response.put("currency", "INR");
            response.put("keyId", keyId);

            return response;

        } catch (RazorpayException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to create Razorpay order",
                    e
            );
        }
    }
}
