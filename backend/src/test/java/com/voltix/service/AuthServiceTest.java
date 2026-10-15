package com.voltix.service;

import com.voltix.dto.AuthResponse;
import com.voltix.dto.LoginRequest;
import com.voltix.dto.RegisterRequest;
import com.voltix.entity.User;
import com.voltix.entity.Wallet;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.repository.UserRepository;
import com.voltix.repository.WalletRepository;
import com.voltix.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider tokenProvider;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Rahul Sharma", "rahul@example.com", "+919876543210", "encodedPass", "USER", "ACTIVE");
        sampleUser.setUserId(1);
    }

    @Test
    void register_Success_CreatesUserAndInitializesWallet() {
        RegisterRequest req = new RegisterRequest("Rahul Sharma", "rahul@example.com", "+919876543210", "SecurePass123!", "DRIVER");

        when(userRepository.existsByEmail("rahul@example.com")).thenReturn(false);
        when(userRepository.existsByPhone("+919876543210")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(walletRepository.save(any(Wallet.class))).thenReturn(new Wallet(sampleUser, BigDecimal.ZERO));
        when(tokenProvider.generateTokenFromUser(any(), any(), any(), any())).thenReturn("mock-jwt-token");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("mock-jwt-token", resp.getToken());
        assertEquals("rahul@example.com", resp.getEmail());
        verify(walletRepository, times(1)).save(any(Wallet.class));
    }

    @Test
    void register_DuplicateEmail_ThrowsConflictException() {
        RegisterRequest req = new RegisterRequest("Rahul Sharma", "existing@example.com", "+919876543210", "SecurePass123!", "DRIVER");

        when(userRepository.existsByEmail("existing@example.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_Success_ReturnsAuthResponse() {
        LoginRequest req = new LoginRequest("rahul@example.com", "SecurePass123!");
        Authentication auth = mock(Authentication.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
        when(userRepository.findByEmail("rahul@example.com")).thenReturn(Optional.of(sampleUser));
        when(tokenProvider.generateToken(auth)).thenReturn("login-jwt-token");

        AuthResponse resp = authService.login(req);

        assertNotNull(resp);
        assertEquals("login-jwt-token", resp.getToken());
        assertEquals(1, resp.getUserId());
    }

    @Test
    void login_InvalidCredentials_ThrowsBadCredentialsException() {
        LoginRequest req = new LoginRequest("rahul@example.com", "WrongPassword");

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThrows(BadCredentialsException.class, () -> authService.login(req));
    }
}
