package com.voltix.service;

import com.voltix.dto.TopUpRequest;
import com.voltix.dto.WalletResponse;
import com.voltix.dto.WalletTransactionResponse;
import com.voltix.entity.User;
import com.voltix.entity.Wallet;
import com.voltix.entity.WalletTransaction;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.UserRepository;
import com.voltix.repository.WalletRepository;
import com.voltix.repository.WalletTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WalletService {

    private static final Logger log = LoggerFactory.getLogger(WalletService.class);

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository transactionRepository;
    private final UserRepository userRepository;

    public WalletService(WalletRepository walletRepository,
                         WalletTransactionRepository transactionRepository,
                         UserRepository userRepository) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public WalletResponse getWallet(Integer userId) {
        Wallet wallet = walletRepository.findByUser_UserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            Wallet newWallet = new Wallet(user, BigDecimal.ZERO);
            return walletRepository.save(newWallet);
        });

        List<WalletTransactionResponse> txs = transactionRepository
                .findByWallet_WalletIdOrderByTimestampDesc(wallet.getWalletId())
                .stream()
                .map(this::mapTxToDto)
                .collect(Collectors.toList());

        return new WalletResponse(wallet.getWalletId(), userId, wallet.getBalance(), txs);
    }

    @Transactional
    public WalletResponse topUp(Integer userId, TopUpRequest request) {
        BigDecimal amount = request.getAmount();
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Top-up amount must be strictly greater than zero");
        }

        // Acquire pessimistic row-level lock on wallet
        Wallet wallet = walletRepository.findWithLockByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            Wallet newWallet = new Wallet(user, BigDecimal.ZERO);
            return walletRepository.save(newWallet);
        });

        // Atomic balance increment
        BigDecimal newBalance = wallet.getBalance().add(amount);
        wallet.setBalance(newBalance);
        wallet.setUpdatedAt(LocalDateTime.now());
        walletRepository.save(wallet);

        // Record immutable audit ledger credit transaction
        WalletTransaction tx = new WalletTransaction(
                wallet,
                amount,
                "CREDIT"
        );
        transactionRepository.save(tx);

        log.info("Wallet top-up processed: userId={}, amount=₹{}, newBalance=₹{}",
                userId, amount, newBalance);

        List<WalletTransactionResponse> txs = transactionRepository
                .findByWallet_WalletIdOrderByTimestampDesc(wallet.getWalletId())
                .stream()
                .map(this::mapTxToDto)
                .collect(Collectors.toList());

        return new WalletResponse(wallet.getWalletId(), userId, newBalance, txs);
    }

    @Transactional(readOnly = true)
    public List<WalletTransactionResponse> getTransactions(Integer userId) {
        return transactionRepository.findByWallet_User_UserIdOrderByTimestampDesc(userId).stream()
                .map(this::mapTxToDto)
                .collect(Collectors.toList());
    }

    private WalletTransactionResponse mapTxToDto(WalletTransaction tx) {
        String desc = "CREDIT".equalsIgnoreCase(tx.getTransactionType())
                ? "Prepaid Balance Top-Up"
                : "Charging Session Settlement";

        return new WalletTransactionResponse(
                tx.getTransactionId(),
                tx.getWallet().getWalletId(),
                tx.getAmount(),
                tx.getTransactionType(),
                tx.getTimestamp(),
                desc,
                null
        );
    }
}
