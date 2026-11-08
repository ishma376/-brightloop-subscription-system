
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.CustomerRequest;
import com.brightloop.backend.model.Customer;
import com.brightloop.backend.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    // CREATE CUSTOMER
    @PostMapping
    public ResponseEntity<Customer> createCustomer(
            @Valid @RequestBody CustomerRequest request) {

        Customer customer = customerService.createCustomer(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(customer);
    }

    // GET ALL CUSTOMERS
    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {

        return ResponseEntity.ok(
                customerService.getAllCustomers()
        );
    }

    // GET CUSTOMER BY ID
    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                customerService.getCustomerById(id)
        );
    }

    // UPDATE CUSTOMER
    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerRequest request) {

        Customer updatedCustomer =
                customerService.updateCustomer(id, request);

        return ResponseEntity.ok(updatedCustomer);
    }
}
