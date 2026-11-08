
package com.brightloop.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import com.nimbusds.jose.proc.SecurityContext;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm;
import org.springframework.security.oauth2.jwt.*;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.List;



@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    
@Bean
public SecurityFilterChain securityFilterChain(
        HttpSecurity http) throws Exception {

    http
        .csrf(csrf -> csrf.disable())

        

.authorizeHttpRequests(auth -> auth

    .requestMatchers(
        HttpMethod.POST,
        "/api/auth/register",
        "/api/auth/login"
    ).permitAll()

    .requestMatchers("/api/test/admin")
        .hasRole("ADMIN")

    .requestMatchers("/api/test/customer")
        .hasRole("CUSTOMER")

    .requestMatchers("/api/admin/**")
        .hasRole("ADMIN")

    .requestMatchers("/api/customer/checkout", "/api/customer/checkout/**")
        .hasRole("CUSTOMER")
        
.requestMatchers(HttpMethod.POST, "/api/products")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/products/**")
    .hasAnyRole("ADMIN", "STAFF")

.requestMatchers(HttpMethod.GET, "/api/products")
    .hasAnyRole("ADMIN", "STAFF")
   
.requestMatchers(
    HttpMethod.POST,
    "/api/products/*/variants"
).hasRole("ADMIN")

.requestMatchers(
    HttpMethod.GET,
    "/api/products/*/variants"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(HttpMethod.PUT, "/api/products/*")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.DELETE, "/api/products/*")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.POST, "/api/plans")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/plans")
    .hasAnyRole("ADMIN", "STAFF", "CUSTOMER")

.requestMatchers(HttpMethod.GET, "/api/plans/*")
    .hasAnyRole("ADMIN", "STAFF", "CUSTOMER")

.requestMatchers(HttpMethod.PUT, "/api/plans/*")
    .hasRole("ADMIN")

.requestMatchers(
        HttpMethod.PATCH,
        "/api/plans/*/activate",
        "/api/plans/*/deactivate"
).hasRole("ADMIN")

.requestMatchers(HttpMethod.POST, "/api/taxes")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.PUT, "/api/taxes/*")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/taxes", "/api/taxes/*")
    .hasAnyRole("ADMIN", "STAFF")

.requestMatchers(HttpMethod.POST, "/api/taxes")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.PUT, "/api/taxes/*")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/taxes", "/api/taxes/*")
    .hasAnyRole("ADMIN", "STAFF")

.requestMatchers(HttpMethod.POST, "/api/discounts")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.PUT, "/api/discounts/*")
    .hasRole("ADMIN")

.requestMatchers(HttpMethod.GET, "/api/discounts", "/api/discounts/*")
    .hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.POST,
    "/api/customers"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.GET,
    "/api/customers",
    "/api/customers/*"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.PUT,
    "/api/customers/*"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.POST,
    "/api/quotations"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.GET,
    "/api/quotations",
    "/api/quotations/*",
    "/api/quotations/customer/*"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.PUT,
    "/api/quotations/*"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.POST,
    "/api/subscriptions"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.GET,
    "/api/subscriptions",
    "/api/subscriptions/*",
    "/api/subscriptions/customer/*",
    "/api/subscriptions/status/*"
).hasAnyRole("ADMIN", "STAFF")


.requestMatchers(
    HttpMethod.PATCH,
    "/api/subscriptions/*/confirm"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.PATCH,
    "/api/subscriptions/*/activate"
).hasAnyRole("ADMIN", "STAFF")


.requestMatchers(
    HttpMethod.PATCH,
    "/api/subscriptions/*/pause"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.PATCH,
    "/api/subscriptions/*/resume"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.PATCH,
    "/api/subscriptions/*/close"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.POST,
    "/api/invoices"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.PATCH,
    "/api/invoices/*/issue"
).hasAnyRole("ADMIN", "STAFF")


.requestMatchers(
    HttpMethod.GET,
    "/api/invoices",
    "/api/invoices/*",
    "/api/invoices/customer/*",
    "/api/invoices/subscription/*",
    "/api/invoices/status/*"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.GET,
    "/api/invoices/*/pdf"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.GET,
    "/api/customer/invoices",
    "/api/customer/invoices/*"
).hasRole("CUSTOMER")

.requestMatchers(
    HttpMethod.GET,
    "/api/customer/invoices/*/pdf"
).hasRole("CUSTOMER")

.requestMatchers("/api/payments", "/api/payments/**")
    .hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    HttpMethod.POST,
    "/api/customer/payments/invoices/*/order"
).hasRole("CUSTOMER")

.requestMatchers(
    HttpMethod.POST,
    "/api/customer/payments/verify"
).hasRole("CUSTOMER")

.requestMatchers(
    "/api/overdue",
    "/api/overdue/**"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    "/api/dashboard",
    "/api/dashboard/**"
).hasAnyRole("ADMIN", "STAFF")

.requestMatchers(
    "/api/reports",
    "/api/reports/**"
).hasAnyRole("ADMIN", "STAFF")


    .anyRequest().authenticated()
)


        // Enable JWT authentication
        
.oauth2ResourceServer(oauth2 ->
    oauth2.jwt(jwt ->
        jwt.jwtAuthenticationConverter(
            jwtAuthenticationConverter()
        )
    )
)

        .httpBasic(basic -> basic.disable())

        .formLogin(form -> form.disable());

    return http.build();
}

    
@Bean
public SecretKey jwtSecretKey(
        @Value("${app.jwt.secret}") String secret) {

    byte[] keyBytes = Base64.getDecoder().decode(secret);

    if (keyBytes.length < 32) {
        throw new IllegalArgumentException(
                "JWT secret must be at least 256 bits"
        );
    }

    return new SecretKeySpec(keyBytes, "HmacSHA256");
}

@Bean
public JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
    return new NimbusJwtEncoder(
            new ImmutableSecret<SecurityContext>(
                    jwtSecretKey
            )
    );
}

@Bean
public JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {

    return NimbusJwtDecoder
            .withSecretKey(jwtSecretKey)
            .macAlgorithm(MacAlgorithm.HS256)
            .build();
}

@Bean
public JwtAuthenticationConverter jwtAuthenticationConverter() {

    JwtAuthenticationConverter converter =
            new JwtAuthenticationConverter();

    converter.setJwtGrantedAuthoritiesConverter(jwt -> {

        String role = jwt.getClaimAsString("role");

        if (role == null || role.isBlank()) {
            return List.of();
        }

        return List.of(
                new SimpleGrantedAuthority("ROLE_" + role)
        );
    });

    return converter;
}


}
