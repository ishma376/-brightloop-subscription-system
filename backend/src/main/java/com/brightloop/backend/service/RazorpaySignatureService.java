
package com.brightloop.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;

@Service
public class RazorpaySignatureService {

    private final String keySecret;

    public RazorpaySignatureService(
            @Value("${razorpay.key.secret}") String keySecret) {

        this.keySecret = keySecret;
    }

    public boolean verifySignature(
            String orderId,
            String paymentId,
            String receivedSignature) {

        if (orderId == null || paymentId == null
                || receivedSignature == null) {
            return false;
        }

        try {
            // Generate the expected signature using the
            // original order ID and payment ID.
            String payload = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKey = new SecretKeySpec(
                    keySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256"
            );

            mac.init(secretKey);

            byte[] expected = mac.doFinal(
                    payload.getBytes(StandardCharsets.UTF_8)
            );

            byte[] received = HexFormat.of()
                    .parseHex(receivedSignature);

            // Constant-time comparison
            return MessageDigest.isEqual(
                    expected,
                    received
            );

        } catch (Exception e) {
            return false;
        }
    }
}
