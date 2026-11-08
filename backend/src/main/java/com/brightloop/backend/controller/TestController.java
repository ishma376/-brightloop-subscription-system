
package com.brightloop.backend.controller;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public Map<String, String> test(Authentication authentication) {

        JwtAuthenticationToken jwt =
                (JwtAuthenticationToken) authentication;

        String userId = jwt.getToken().getSubject();

        return Map.of(
                "message", "JWT authentication successful",
                "userId", userId
        );
    }
    
@GetMapping("/api/test/admin")
public Map<String, String> adminTest() {
    return Map.of(
        "message", "Admin access granted"
    );
}

@GetMapping("/api/test/customer")
public Map<String, String> customerTest() {
    return Map.of(
        "message", "Customer access granted"
    );
}

}
