package com.voltix.service;

import com.voltix.dto.TopUpRequest;
import com.voltix.dto.WalletResponse;
import com.voltix.dto.WalletTransactionResponse;
import com.voltix.entity.User;
import com.voltix.entity.Wallet;
import com.voltix.entity.WalletTransaction;
import com.voltix.exception.BadRequestException;
import com.voltix.repository.UserRepository;
import com.voltix.repository.WalletRepository;
import com.voltix.repository.WalletTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceTest {

    @Mock
    private WalletRepository walletRepository;

    @Mock
    private WalletTransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private WalletService walletService;

    private User driver;
    private Wallet wallet;

    @BeforeEach
    void setUp() {
        driver = new User("Rahul Sharma", "rahul@example.com", "+919876543210", "hash", "USER", "ACTIVE");
        driver.setUserId(1);

        wallet = new Wallet(driver, new BigDecimal("250.00"));
        wallet.setWalletId(10);
    }

    @Test
    void topUp_ZeroOrNegativeAmount_ThrowsBadRequest() {
        TopUpRequest reqZero = new TopUpRequest(BigDecimal.ZERO);
        assertThrows(BadRequestException.class, () -> walletService.topUp(1, reqZero));

        TopUpRequest reqNegative = new TopUpRequest(new BigDecimal("-50.00"));
        assertThrows(BadRequestException.class, () -> walletService.topUp(1, reqNegative));
    }

    @Test
    void topUp_Success_IncrementsBalanceAndSavesTransaction() {
        when(walletRepository.findWithLockByUserId(1)).thenReturn(Optional.of(wallet));
        when(walletRepository.save(any(Wallet.class))).thenAnswer(i -> i.getArguments()[0]);
        when(transactionRepository.save(any(WalletTransaction.class))).thenAnswer(i -> i.getArguments()[0]);
        when(transactionRepository.findByWallet_WalletIdOrderByTimestampDesc(10)).thenReturn(Collections.emptyList());

        TopUpRequest req = new TopUpRequest(new BigDecimal("500.00"));
        WalletResponse resp = walletService.topUp(1, req);

        assertNotNull(resp);
        assertEquals(new BigDecimal("750.00"), resp.getBalance());
        verify(walletRepository, times(1)).save(wallet);
        verify(transactionRepository, times(1)).save(any(WalletTransaction.class));
    }

    @Test
    void getWallet_CreatesWalletIfAbsent() {
        when(walletRepository.findByUser_UserId(2)).thenReturn(Optional.empty());

        User newUser = new User("New User", "new@example.com", "+919876543299", "hash", "USER", "ACTIVE");
        newUser.setUserId(2);

        when(userRepository.findById(2)).thenReturn(Optional.of(newUser));
        Wallet createdWallet = new Wallet(newUser, BigDecimal.ZERO);
        createdWallet.setWalletId(20);
        when(walletRepository.save(any(Wallet.class))).thenReturn(createdWallet);
        when(transactionRepository.findByWallet_WalletIdOrderByTimestampDesc(20)).thenReturn(Collections.emptyList());

        WalletResponse resp = walletService.getWallet(2);

        assertNotNull(resp);
        assertEquals(BigDecimal.ZERO, resp.getBalance());
        assertEquals(20, resp.getWalletId());
    }

    @Test
    void getTransactions_ReturnsSortedTransactions() {
        WalletTransaction tx = new WalletTransaction(wallet, new BigDecimal("100.00"), "CREDIT");
        tx.setTransactionId(1);
        tx.setTimestamp(LocalDateTime.now());

        when(transactionRepository.findByWallet_User_UserIdOrderByTimestampDesc(1))
                .thenReturn(List.of(tx));

        List<WalletTransactionResponse> list = walletService.getTransactions(1);

        assertEquals(1, list.size());
        assertEquals("CREDIT", list.get(0).getTransactionType());
        assertEquals(new BigDecimal("100.00"), list.get(0).getAmount());
    }
}
