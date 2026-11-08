
package com.brightloop.backend.service;

import com.brightloop.backend.dto.CreateStaffRequest;
import com.brightloop.backend.model.Role;
import com.brightloop.backend.model.User;
import com.brightloop.backend.repository.UserRepository;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Locale;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User createStaff(CreateStaffRequest request) {

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

        User staff = new User(
                request.getName().trim(),
                email,
                hashedPassword,
                Role.STAFF
        );

        try {
            return userRepository.saveAndFlush(staff);
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Unable to create staff account",
                    ex
            );
        }
    }
}

