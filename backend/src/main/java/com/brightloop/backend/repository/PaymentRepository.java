
package com.brightloop.backend.repository;

import com.brightloop.backend.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByInvoiceIdOrderByCreatedAtDesc(Long invoiceId);

}
