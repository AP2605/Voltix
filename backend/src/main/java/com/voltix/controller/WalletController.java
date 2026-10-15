package com.voltix.controller;

import com.voltix.dto.TopUpRequest;
import com.voltix.dto.WalletResponse;
import com.voltix.dto.WalletTransactionResponse;
import com.voltix.security.SecurityUtils;
import com.voltix.service.WalletService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wallet")
@Tag(name = "Wallet", description = "Prepaid wallet management and ledger transaction auditing")
public class WalletController {

    private final WalletService walletService;

    public WalletController(WalletService walletService) {
        this.walletService = walletService;
    }

    @GetMapping
    @Operation(summary = "Retrieve current prepaid balance and recent transactions for authenticated driver")
    public ResponseEntity<WalletResponse> getWallet() {
        Integer userId = SecurityUtils.getCurrentUserId();
        WalletResponse wallet = walletService.getWallet(userId);
        return ResponseEntity.ok(wallet);
    }

    @PostMapping("/top-up")
    @Operation(summary = "Add funds to prepaid balance with pessimistic write locking")
    public ResponseEntity<WalletResponse> topUp(@Valid @RequestBody TopUpRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        WalletResponse response = walletService.topUp(userId, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    @Operation(summary = "Retrieve complete ledger audit history of wallet credits and debits")
    public ResponseEntity<List<WalletTransactionResponse>> getTransactions() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<WalletTransactionResponse> txs = walletService.getTransactions(userId);
        return ResponseEntity.ok(txs);
    }
}
