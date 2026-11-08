
package com.brightloop.backend.repository;

import com.brightloop.backend.model.RazorpayOrder;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import jakarta.persistence.LockModeType;

import java.util.Optional;

public interface RazorpayOrderRepository
        extends JpaRepository<RazorpayOrder, Long> {

    // Find an order using its Razorpay order ID
    Optional<RazorpayOrder> findByRazorpayOrderId(
            String razorpayOrderId
    );

    // Check whether a payment ID already exists
    boolean existsByRazorpayPaymentId(
            String razorpayPaymentId
    );

    // Lock the order during payment verification
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
        SELECT r
        FROM RazorpayOrder r
        WHERE r.razorpayOrderId = :orderId
        """)
    Optional<RazorpayOrder> findLockedByRazorpayOrderId(
            @Param("orderId") String orderId
    );
}
