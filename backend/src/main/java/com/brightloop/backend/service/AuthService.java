
package com.brightloop.backend.service;

import com.brightloop.backend.dto.RegisterRequest;
import com.brightloop.backend.model.Role;
import com.brightloop.backend.model.User;
import com.brightloop.backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import com.brightloop.backend.dto.LoginRequest;


import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(RegisterRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        String hashedPassword =
                passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getName().trim(),
                email,
                hashedPassword,
                Role.CUSTOMER
        );

        try {
            return userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Unable to register: email may already exist",
                    ex
            );
        }
    }
    
public User login(LoginRequest request) {

    String email = request.getEmail()
            .trim()
            .toLowerCase(Locale.ROOT);

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            ));

    boolean passwordMatches = passwordEncoder.matches(
            request.getPassword(),
            user.getPassword()
    );

    if (!passwordMatches) {
        throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
        );
    }

    return user;
}

}

