
package com.brightloop.backend.service;

import com.brightloop.backend.dto.CustomerRequest;
import com.brightloop.backend.model.Customer;
import com.brightloop.backend.repository.CustomerRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // CREATE CUSTOMER
    @Transactional
    public Customer createCustomer(CustomerRequest request) {

        String email = request.getEmail().trim().toLowerCase();
        String name = request.getName().trim();

        if (customerRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Customer with this email already exists"
            );
        }

        Customer customer = new Customer();

        customer.setName(name);
        customer.setEmail(email);
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setIsActive(request.getIsActive());

        try {
            return customerRepository.saveAndFlush(customer);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Customer email already exists or violates a database constraint",
                ex
            );
        }
    }

    // GET ALL CUSTOMERS
    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // GET CUSTOMER BY ID
    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {

        return customerRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Customer not found"
            ));
    }

    // UPDATE CUSTOMER
    @Transactional
    public Customer updateCustomer(Long id, CustomerRequest request) {

        Customer customer = getCustomerById(id);

        String email = request.getEmail().trim().toLowerCase();
        String name = request.getName().trim();

        customerRepository.findByEmailIgnoreCase(email)
            .ifPresent(existing -> {
                if (!existing.getId().equals(id)) {
                    throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Another customer already uses this email"
                    );
                }
            });

        customer.setName(name);
        customer.setEmail(email);
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setIsActive(request.getIsActive());

        try {
            return customerRepository.saveAndFlush(customer);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Customer update violates a database constraint",
                ex
            );
        }
    }
}
