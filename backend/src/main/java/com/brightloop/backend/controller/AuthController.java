
package com.brightloop.backend.controller;

import com.brightloop.backend.dto.RegisterRequest;
import com.brightloop.backend.model.User;
import com.brightloop.backend.service.AuthService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.brightloop.backend.dto.LoginRequest;
import com.brightloop.backend.service.JwtService;


import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    
private final AuthService authService;
private final JwtService jwtService;

public AuthController(
        AuthService authService,
        JwtService jwtService) {

    this.authService = authService;
    this.jwtService = jwtService;
}


    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request) {

        User user = authService.register(request);

        Map<String, Object> response = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name(),
                "message", "Registration successful"
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    
@PostMapping("/login")
public ResponseEntity<Map<String, Object>> login(
        @Valid @RequestBody LoginRequest request) {

    User user = authService.login(request);

    String token = jwtService.generateToken(user);

    Map<String, Object> response = Map.of(
            "token", token,
            "tokenType", "Bearer",
            "id", user.getId(),
            "name", user.getName(),
            "email", user.getEmail(),
            "role", user.getRole().name(),
            "message", "Login successful"
    );

    return ResponseEntity.ok(response);
}

}

