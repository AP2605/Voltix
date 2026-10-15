package com.voltix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class ProcessPaymentRequest {

    @NotNull(message = "Session ID is required")
    private Integer sessionId;

    @NotBlank(message = "Payment method is required (WALLET, UPI, CARD)")
    private String paymentMethod; // 'WALLET', 'UPI', 'CARD'

    private BigDecimal amount; // Client advisory only; actual amount is enforced by server

    public ProcessPaymentRequest() {}

    public ProcessPaymentRequest(Integer sessionId, String paymentMethod) {
        this.sessionId = sessionId;
        this.paymentMethod = paymentMethod;
    }

    public ProcessPaymentRequest(Integer sessionId, String paymentMethod, BigDecimal amount) {
        this.sessionId = sessionId;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
    }

    public Integer getSessionId() { return sessionId; }
    public void setSessionId(Integer sessionId) { this.sessionId = sessionId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
}
