
package com.brightloop.backend.service;

import com.brightloop.backend.model.Customer;
import com.brightloop.backend.model.Invoice;
import com.brightloop.backend.model.User;

import com.brightloop.backend.repository.CustomerRepository;
import com.brightloop.backend.repository.InvoiceRepository;
import com.brightloop.backend.repository.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerInvoiceService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    public CustomerInvoiceService(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            InvoiceRepository invoiceRepository) {

        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
    }

    // FIND CUSTOMER USING THE VERIFIED JWT
    public Customer getAuthenticatedCustomer(Jwt jwt) {

        Long userId;

        try {
            userId = Long.valueOf(jwt.getSubject());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid user identity"
            );
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Authenticated user not found"
                ));

        Customer customer = customerRepository
                .findByEmailIgnoreCase(user.getEmail())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Customer profile not found"
                ));

        if (!Boolean.TRUE.equals(customer.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Customer account is inactive"
            );
        }

        return customer;
    }

    // GET LOGGED-IN CUSTOMER'S INVOICES
    @Transactional(readOnly = true)
    public List<Invoice> getMyInvoices(Jwt jwt) {

        Customer customer = getAuthenticatedCustomer(jwt);

        return invoiceRepository.findByCustomerId(
                customer.getId()
        );
    }

    // GET ONE INVOICE ONLY IF IT BELONGS TO THE CUSTOMER
    @Transactional(readOnly = true)
    public Invoice getMyInvoice(Long invoiceId, Jwt jwt) {

        Customer customer = getAuthenticatedCustomer(jwt);

        return invoiceRepository
                .findByIdAndCustomerId(invoiceId, customer.getId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Invoice not found"
                ));
    }
}
