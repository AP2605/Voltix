package com.voltix.service;

import com.voltix.dto.AuthResponse;
import com.voltix.dto.LoginRequest;
import com.voltix.dto.RegisterRequest;
import com.voltix.dto.UserProfileResponse;
import com.voltix.entity.User;
import com.voltix.entity.Wallet;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.UserRepository;
import com.voltix.repository.WalletRepository;
import com.voltix.security.JwtTokenProvider;
import com.voltix.security.SecurityUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    public AuthService(UserRepository userRepository,
                       WalletRepository walletRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("An account with email " + email + " already exists");
        }

        String phone = request.getPhone().trim();
        if (userRepository.existsByPhone(phone)) {
            throw new ConflictException("An account with phone " + phone + " already exists");
        }

        // Public registration is restricted to standard DRIVER / USER role
        User user = new User(
                request.getName().trim(),
                email,
                phone,
                passwordEncoder.encode(request.getPassword()),
                "USER",
                "ACTIVE"
        );
        user = userRepository.save(user);

        // Initialize user wallet with 0 balance
        Wallet wallet = new Wallet(user, BigDecimal.ZERO);
        walletRepository.save(wallet);

        log.info("New user registered successfully: id={}, email={}", user.getUserId(), user.getEmail());

        String token = tokenProvider.generateTokenFromUser(
                user.getUserId(),
                user.getEmail(),
                user.getRole(),
                user.getName()
        );

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.getPassword())
        );

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Check account active status
        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("Account is currently " + user.getStatus().toLowerCase() + ". Please contact support.");
        }

        // If frontend requested a specific role, verify compatibility
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String expectedRole = request.getRole().trim().toUpperCase();
            String userRole = user.getRole().toUpperCase();
            if (!expectedRole.equals(userRole)) {
                // Support DRIVER mapping to USER
                boolean isDriverMatch = ("DRIVER".equals(expectedRole) && "USER".equals(userRole))
                        || ("USER".equals(expectedRole) && "DRIVER".equals(userRole));
                if (!isDriverMatch) {
                    throw new BadRequestException("Unable to sign in as " + expectedRole + ". Your account is registered as " + userRole);
                }
            }
        }

        String token = tokenProvider.generateToken(authentication);

        log.info("User logged in successfully: id={}, email={}, role={}", user.getUserId(), user.getEmail(), user.getRole());

        return new AuthResponse(
                token,
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser() {
        Integer userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        return new UserProfileResponse(
                user.getUserId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole(),
                user.getStatus(),
                user.getCreatedAt()
        );
    }
}
