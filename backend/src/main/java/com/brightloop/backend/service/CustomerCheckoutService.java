
package com.brightloop.backend.service;

import com.brightloop.backend.model.Customer;
import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.InvoiceStatus;
import com.brightloop.backend.model.Subscription;
import com.brightloop.backend.model.SubscriptionPlan;
import com.brightloop.backend.model.SubscriptionStatus;

import com.brightloop.backend.repository.InvoiceRepository;
import com.brightloop.backend.repository.SubscriptionPlanRepository;
import com.brightloop.backend.repository.SubscriptionRepository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class CustomerCheckoutService {

    private final CustomerInvoiceService customerInvoiceService;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final InvoiceRepository invoiceRepository;
    private final EntityManager entityManager;

    public CustomerCheckoutService(
            CustomerInvoiceService customerInvoiceService,
            SubscriptionPlanRepository planRepository,
            SubscriptionRepository subscriptionRepository,
            InvoiceRepository invoiceRepository,
            EntityManager entityManager) {

        this.customerInvoiceService = customerInvoiceService;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.invoiceRepository = invoiceRepository;
        this.entityManager = entityManager;
    }

    public record CheckoutResponse(
            Long subscriptionId,
            Long invoiceId,
            String invoiceNumber,
            String planName,
            BigDecimal amount,
            String currency,
            String message
    ) {}

    @Transactional
    public CheckoutResponse createCheckout(
            Long planId,
            Jwt jwt) {

        if (planId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Subscription plan is required"
            );
        }

        // Identify customer using the authenticated account.
        Customer customer =
                customerInvoiceService.getAuthenticatedCustomer(jwt);

        // Serialize purchases for the same customer.
        // This reduces duplicate creation from simultaneous requests.
        customer = entityManager.find(
                Customer.class,
                customer.getId(),
                LockModeType.PESSIMISTIC_WRITE
        );

        if (customer == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Customer not found"
            );
        }

        // Load plan from the database.
        SubscriptionPlan plan = planRepository
                .findById(planId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Subscription plan not found"
                ));

        if (!Boolean.TRUE.equals(plan.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This subscription plan is not available"
            );
        }

        if (plan.getPrice() == null
                || plan.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Plan price must be greater than zero"
            );
        }

        // This first checkout version supports one unit only.
        if (plan.getMinimumQuantity() == null
                || plan.getMinimumQuantity() != 1) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This plan requires quantity-based checkout"
            );
        }

        // Check existing subscriptions for this customer and plan.
        List<Subscription> existingSubscriptions =
                subscriptionRepository.findByCustomerId(
                        customer.getId()
                );

        for (Subscription existing : existingSubscriptions) {

            if (!existing.getPlan().getId().equals(planId)) {
                continue;
            }

            if (existing.getStatus()
                    == SubscriptionStatus.ACTIVE
                    || existing.getStatus()
                    == SubscriptionStatus.PAUSED) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "You already have this subscription"
                );
            }

            if (existing.getStatus()
                    == SubscriptionStatus.CONFIRMED) {

                List<Invoice> invoices =
                        invoiceRepository.findBySubscriptionId(
                                existing.getId()
                        );

                for (Invoice invoice : invoices) {

                    if (invoice.getStatus() == InvoiceStatus.ISSUED
                            && invoice.getBalanceDue() != null
                            && invoice.getBalanceDue()
                                    .compareTo(BigDecimal.ZERO) > 0) {

                        // Reuse an existing unpaid checkout.
                        return toResponse(
                                existing,
                                invoice,
                                "Existing checkout retrieved"
                        );
                    }
                }

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "An existing subscription requires review"
                );
            }
        }

        LocalDate today = LocalDate.now();
        LocalDate periodEnd;

        switch (plan.getBillingPeriod()) {
            case DAILY:
                periodEnd = today;
                break;

            case WEEKLY:
                periodEnd = today.plusWeeks(1).minusDays(1);
                break;

            case MONTHLY:
                periodEnd = today.plusMonths(1).minusDays(1);
                break;

            case YEARLY:
                periodEnd = today.plusYears(1).minusDays(1);
                break;

            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unsupported billing period"
                );
        }

        // Create a subscription awaiting payment.
        Subscription subscription = new Subscription();

        subscription.setCustomer(customer);
        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.CONFIRMED);

        subscription.setStartDate(today);
        subscription.setEndDate(periodEnd);
        subscription.setNextBillingDate(null);
        subscription.setAutoRenew(
                Boolean.TRUE.equals(plan.getAutoRenew())
        );

        subscription =
                subscriptionRepository.saveAndFlush(subscription);

        // Create the first invoice using the stored plan price.
        BigDecimal price = plan.getPrice();

        Invoice invoice = new Invoice();

        invoice.setInvoiceNumber(
                "INV-CHK-" + UUID.randomUUID()
                        .toString()
                        .substring(0, 8)
                        .toUpperCase()
        );

        invoice.setCustomer(customer);
        invoice.setSubscription(subscription);

        invoice.setStatus(InvoiceStatus.ISSUED);

        invoice.setInvoiceDate(today);
        invoice.setDueDate(today);

        invoice.setBillingPeriodStart(today);
        invoice.setBillingPeriodEnd(periodEnd);

        invoice.setSubtotal(price);
        invoice.setDiscountAmount(BigDecimal.ZERO);
        invoice.setTaxableAmount(price);
        invoice.setTaxAmount(BigDecimal.ZERO);
        invoice.setTotalAmount(price);

        invoice.setAmountPaid(BigDecimal.ZERO);
        invoice.setBalanceDue(price);

        invoice = invoiceRepository.saveAndFlush(invoice);

        return toResponse(
                subscription,
                invoice,
                "Checkout created successfully"
        );
    }

    private CheckoutResponse toResponse(
            Subscription subscription,
            Invoice invoice,
            String message) {

        return new CheckoutResponse(
                subscription.getId(),
                invoice.getId(),
                invoice.getInvoiceNumber(),
                subscription.getPlan().getName(),
                invoice.getTotalAmount(),
                "INR",
                message
        );
    }
}
