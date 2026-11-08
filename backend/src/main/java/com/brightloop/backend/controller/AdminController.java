
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.CreateStaffRequest;
import com.brightloop.backend.model.User;
import com.brightloop.backend.service.AdminService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/staff")
    public ResponseEntity<Map<String, Object>> createStaff(
            @Valid @RequestBody CreateStaffRequest request) {

        User staff = adminService.createStaff(request);

        Map<String, Object> response = Map.of(
                "id", staff.getId(),
                "name", staff.getName(),
                "email", staff.getEmail(),
                "role", staff.getRole().name(),
                "message", "Staff account created successfully"
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
}

