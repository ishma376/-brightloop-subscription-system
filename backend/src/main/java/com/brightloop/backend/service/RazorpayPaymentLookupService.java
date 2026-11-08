
package com.brightloop.backend.service;

import com.brightloop.backend.model.RazorpayOrder;

import com.razorpay.Payment;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class RazorpayPaymentLookupService {

    private final RazorpayClient razorpayClient;

    public RazorpayPaymentLookupService(
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret
    ) throws RazorpayException {

        this.razorpayClient =
                new RazorpayClient(keyId, keySecret);
    }

    public String verifyCapturedPayment(
            RazorpayOrder savedOrder,
            String paymentId) {

        try {
            // Fetch actual payment details from Razorpay.
            Payment payment =
                    razorpayClient.payments.fetch(paymentId);

            String actualOrderId =
                    payment.get("order_id");

            String status =
                    payment.get("status");

            String currency =
                    payment.get("currency");

            // Safely convert Integer or Long to long.
            Number amountValue = payment.get("amount");

            if (amountValue == null) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Razorpay payment amount is missing"
                );
            }

            long actualAmount = amountValue.longValue();

            // Confirm the payment belongs to our saved order.
            if (!savedOrder.getRazorpayOrderId()
                    .equals(actualOrderId)) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Payment belongs to a different order"
                );
            }

            // Confirm payment was captured.
            if (!"captured".equals(status)) {

                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Razorpay payment is not captured"
                );
            }

            // Confirm currency.
            if (!"INR".equals(currency)) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Unexpected payment currency"
                );
            }

            // Confirm exact amount in paise.
            if (actualAmount != savedOrder.getAmountPaise()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Payment amount does not match the order"
                );
            }

            return paymentId;

        } catch (RazorpayException e) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_GATEWAY,
                    "Unable to verify payment with Razorpay",
                    e
            );
        }
    }
}
