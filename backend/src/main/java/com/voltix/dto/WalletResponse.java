package com.voltix.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class WalletResponse {

    private Integer walletId;
    private Integer userId;
    private BigDecimal balance;
    private List<WalletTransactionResponse> transactions = new ArrayList<>();

    public WalletResponse() {}

    public WalletResponse(Integer walletId, Integer userId, BigDecimal balance, List<WalletTransactionResponse> transactions) {
        this.walletId = walletId;
        this.userId = userId;
        this.balance = balance;
        this.transactions = transactions != null ? transactions : new ArrayList<>();
    }

    public Integer getWalletId() { return walletId; }
    public void setWalletId(Integer walletId) { this.walletId = walletId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public BigDecimal getBalance() { return balance; }
    public void setBalance(BigDecimal balance) { this.balance = balance; }

    public List<WalletTransactionResponse> getTransactions() { return transactions; }
    public void setTransactions(List<WalletTransactionResponse> transactions) { this.transactions = transactions; }
}
