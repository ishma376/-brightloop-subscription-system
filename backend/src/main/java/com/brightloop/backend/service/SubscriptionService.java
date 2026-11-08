
package com.brightloop.backend.service;

import com.brightloop.backend.dto.SubscriptionRequest;

import com.brightloop.backend.model.Customer;
import com.brightloop.backend.model.Quotation;
import com.brightloop.backend.model.QuotationStatus;
import com.brightloop.backend.model.Subscription;
import com.brightloop.backend.model.SubscriptionPlan;
import com.brightloop.backend.model.SubscriptionStatus;

import com.brightloop.backend.repository.CustomerRepository;
import com.brightloop.backend.repository.QuotationRepository;
import com.brightloop.backend.repository.SubscriptionPlanRepository;
import com.brightloop.backend.repository.SubscriptionRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.LocalDate;

import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CustomerRepository customerRepository;
    private final SubscriptionPlanRepository planRepository;
    private final QuotationRepository quotationRepository;

    public SubscriptionService(
            SubscriptionRepository subscriptionRepository,
            CustomerRepository customerRepository,
            SubscriptionPlanRepository planRepository,
            QuotationRepository quotationRepository) {

        this.subscriptionRepository = subscriptionRepository;
        this.customerRepository = customerRepository;
        this.planRepository = planRepository;
        this.quotationRepository = quotationRepository;
    }

    // CREATE SUBSCRIPTION
    @Transactional
    public Subscription createSubscription(
            SubscriptionRequest request) {

        // Validate customer
        Customer customer = customerRepository
                .findById(request.getCustomerId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer not found"
                ));

        if (!Boolean.TRUE.equals(customer.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot create subscription for inactive customer"
            );
        }

        // Validate subscription plan
        SubscriptionPlan plan = planRepository
                .findById(request.getPlanId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Subscription plan not found"
                ));

        // Validate dates
        if (request.getEndDate() != null &&
                request.getEndDate().isBefore(
                        request.getStartDate())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "End date cannot be before start date"
            );
        }

        // Validate optional quotation
        Quotation quotation = null;

        if (request.getQuotationId() != null) {

            quotation = quotationRepository
                    .findById(request.getQuotationId())
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Quotation not found"
                    ));

            if (!quotation.getCustomer().getId()
                    .equals(customer.getId())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Quotation belongs to a different customer"
                );
            }

            if (quotation.getStatus() != QuotationStatus.CONFIRMED) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Quotation must be CONFIRMED"
                );
            }

            if (subscriptionRepository.existsByQuotationId(
                    quotation.getId())) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Quotation already has a subscription"
                );
            }
        }

        // Create subscription
        Subscription subscription = new Subscription();

        subscription.setCustomer(customer);
        subscription.setQuotation(quotation);
        subscription.setPlan(plan);
        subscription.setStatus(SubscriptionStatus.DRAFT);

        subscription.setStartDate(request.getStartDate());
        subscription.setEndDate(request.getEndDate());
        subscription.setAutoRenew(request.getAutoRenew());

        // Billing begins after activation.
        subscription.setNextBillingDate(null);

        return subscriptionRepository.saveAndFlush(subscription);
    }

    // GET ALL SUBSCRIPTIONS
    @Transactional(readOnly = true)
    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    // GET SUBSCRIPTION BY ID
    @Transactional(readOnly = true)
    public Subscription getSubscriptionById(Long id) {

        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Subscription not found"
                ));
    }

    // GET SUBSCRIPTIONS BY CUSTOMER
    @Transactional(readOnly = true)
    public List<Subscription> getSubscriptionsByCustomer(
            Long customerId) {

        if (!customerRepository.existsById(customerId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Customer not found"
            );
        }

        return subscriptionRepository.findByCustomerId(customerId);
    }

    // GET SUBSCRIPTIONS BY STATUS
    @Transactional(readOnly = true)
    public List<Subscription> getSubscriptionsByStatus(
            SubscriptionStatus status) {

        return subscriptionRepository.findByStatus(status);
    }

    // CONFIRM SUBSCRIPTION
    @Transactional
    public Subscription confirmSubscription(Long id) {

        Subscription subscription =
                getSubscriptionById(id);

        if (subscription.getStatus()
                != SubscriptionStatus.DRAFT) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only DRAFT subscriptions can be confirmed"
            );
        }

        subscription.setStatus(SubscriptionStatus.CONFIRMED);

        return subscriptionRepository.save(subscription);
    }
    
    // ACTIVATE SUBSCRIPTION
    @Transactional
    public Subscription activateSubscription(Long id) {

        Subscription subscription =
                getSubscriptionById(id);

        // Only confirmed subscriptions can be activated
        if (subscription.getStatus()
                != SubscriptionStatus.CONFIRMED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only CONFIRMED subscriptions can be activated"
            );
        }

        // Subscription must not have already expired
        LocalDate today = LocalDate.now();

        if (subscription.getEndDate() != null &&
                subscription.getEndDate().isBefore(today)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot activate an expired subscription"
            );
        }

        // Activate subscription
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        // Billing will begin from the subscription start date
        subscription.setNextBillingDate(
                subscription.getStartDate()
        );

        return subscriptionRepository.save(subscription);
    }
    
    // PAUSE SUBSCRIPTION
    @Transactional
    public Subscription pauseSubscription(Long id) {

        Subscription subscription =
                getSubscriptionById(id);

        // Only ACTIVE subscriptions can be paused
        if (subscription.getStatus()
                != SubscriptionStatus.ACTIVE) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only ACTIVE subscriptions can be paused"
            );
        }

        // Check whether the selected plan permits pausing
        if (!Boolean.TRUE.equals(
                subscription.getPlan().getAllowPause())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This subscription plan does not allow pausing"
            );
        }

        // Pause the subscription
        subscription.setStatus(SubscriptionStatus.PAUSED);

        return subscriptionRepository.save(subscription);
    }
    
    // RESUME SUBSCRIPTION
    @Transactional
    public Subscription resumeSubscription(Long id) {

        Subscription subscription =
                getSubscriptionById(id);

        // Only PAUSED subscriptions can be resumed
        if (subscription.getStatus()
                != SubscriptionStatus.PAUSED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only PAUSED subscriptions can be resumed"
            );
        }

        // Check whether the subscription has expired
        LocalDate today = LocalDate.now();

        if (subscription.getEndDate() != null &&
                subscription.getEndDate().isBefore(today)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cannot resume an expired subscription"
            );
        }

        // Resume the subscription
        subscription.setStatus(SubscriptionStatus.ACTIVE);

        return subscriptionRepository.save(subscription);
    }
    
    // CLOSE SUBSCRIPTION
    @Transactional
    public Subscription closeSubscription(Long id) {

        Subscription subscription =
                getSubscriptionById(id);

        // Only ACTIVE or PAUSED subscriptions can be closed
        if (subscription.getStatus() != SubscriptionStatus.ACTIVE
                && subscription.getStatus() != SubscriptionStatus.PAUSED) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only ACTIVE or PAUSED subscriptions can be closed"
            );
        }

        LocalDate today = LocalDate.now();

        // Check whether early closing is permitted
        boolean earlyClose = subscription.getEndDate() == null
                || today.isBefore(subscription.getEndDate());

        if (earlyClose && !Boolean.TRUE.equals(
                subscription.getPlan().getAllowEarlyClose())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This subscription plan does not allow early closing"
            );
        }

        // Close subscription
        subscription.setStatus(SubscriptionStatus.CLOSED);

        // Prevent future billing from being scheduled
        subscription.setNextBillingDate(null);
        subscription.setAutoRenew(false);

        return subscriptionRepository.save(subscription);
    }
    
    // AUTOMATICALLY CLOSE EXPIRED SUBSCRIPTIONS
    @Transactional
    public int autoCloseExpiredSubscriptions() {

        LocalDate today = LocalDate.now();
        int closedCount = 0;

        List<Subscription> subscriptions =
                subscriptionRepository.findAll();

        for (Subscription subscription : subscriptions) {

            boolean eligibleStatus =
                    subscription.getStatus() == SubscriptionStatus.ACTIVE
                    || subscription.getStatus() == SubscriptionStatus.PAUSED;

            boolean expired =
                    subscription.getEndDate() != null
                    && subscription.getEndDate().isBefore(today);

            boolean autoCloseEnabled =
                    Boolean.TRUE.equals(
                            subscription.getPlan().getAutoClose()
                    );

            
            // Check whether automatic renewal is enabled
            boolean renewalEnabled =
                    Boolean.TRUE.equals(subscription.getAutoRenew())
                    && Boolean.TRUE.equals(
                            subscription.getPlan().getAutoRenew()
                    );

            // Do not automatically close renewable subscriptions
            if (eligibleStatus
                    && expired
                    && autoCloseEnabled
                    && !renewalEnabled) {

                subscription.setStatus(SubscriptionStatus.CLOSED);
                subscription.setNextBillingDate(null);
                subscription.setAutoRenew(false);

                subscriptionRepository.save(subscription);
                closedCount++;
            }
        }

        return closedCount;
    }

    // AUTOMATICALLY RENEW EXPIRED SUBSCRIPTIONS
    @Transactional
    public int autoRenewExpiredSubscriptions() {

        LocalDate today = LocalDate.now();
        int renewedCount = 0;

        List<Subscription> subscriptions =
                subscriptionRepository.findAll();

        for (Subscription subscription : subscriptions) {

            // Only ACTIVE subscriptions can renew
            if (subscription.getStatus()
                    != SubscriptionStatus.ACTIVE) {
                continue;
            }

            // Both subscription and plan must allow renewal
            boolean renewalEnabled =
                    Boolean.TRUE.equals(subscription.getAutoRenew())
                    && Boolean.TRUE.equals(
                            subscription.getPlan().getAutoRenew()
                    );

            if (!renewalEnabled) {
                continue;
            }

            LocalDate endDate = subscription.getEndDate();

            // Renew only subscriptions with an expired end date
            if (endDate == null || !endDate.isBefore(today)) {
                continue;
            }

            // Start the next cycle after the previous end date
            LocalDate nextStartDate = endDate.plusDays(1);
            LocalDate nextEndDate;

            switch (subscription.getPlan().getBillingPeriod()) {

                case DAILY:
                    nextEndDate = nextStartDate;
                    break;

                case WEEKLY:
                    nextEndDate = nextStartDate
                            .plusWeeks(1)
                            .minusDays(1);
                    break;

                case MONTHLY:
                    nextEndDate = nextStartDate
                            .plusMonths(1)
                            .minusDays(1);
                    break;

                case YEARLY:
                    nextEndDate = nextStartDate
                            .plusYears(1)
                            .minusDays(1);
                    break;

                default:
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Unsupported billing period"
                    );
            }
            
            // Catch up if multiple billing cycles were missed
            // without creating an unlimited renewal loop.
            int cycles = 0;
            final int maxCycles = 1200;

            while (nextEndDate.isBefore(today)
                    && cycles < maxCycles) {

                LocalDate followingStartDate =
                        nextEndDate.plusDays(1);

                switch (subscription.getPlan().getBillingPeriod()) {

                    case DAILY:
                        nextEndDate = followingStartDate;
                        break;

                    case WEEKLY:
                        nextEndDate = followingStartDate
                                .plusWeeks(1)
                                .minusDays(1);
                        break;

                    case MONTHLY:
                        nextEndDate = followingStartDate
                                .plusMonths(1)
                                .minusDays(1);
                        break;

                    case YEARLY:
                        nextEndDate = followingStartDate
                                .plusYears(1)
                                .minusDays(1);
                        break;

                    default:
                        throw new ResponseStatusException(
                                HttpStatus.BAD_REQUEST,
                                "Unsupported billing period"
                        );
                }

                cycles++;
            }

            if (nextEndDate.isBefore(today)) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Subscription requires manual renewal review"
                );
            }


            // Extend subscription
            subscription.setEndDate(nextEndDate);

            subscriptionRepository.save(subscription);

            renewedCount++;
        }

        return renewedCount;
    }
    
    // COORDINATE AUTOMATIC SUBSCRIPTION LIFECYCLE
    @Transactional
    public void processExpiredSubscriptions() {

        // First renew subscriptions eligible for renewal
        autoRenewExpiredSubscriptions();

        // Then close expired subscriptions
        // that are not eligible for renewal
        autoCloseExpiredSubscriptions();
    }


}
