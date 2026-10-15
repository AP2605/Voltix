package com.voltix.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class TopUpRequest {

    @NotNull(message = "Top-up amount is required")
    @DecimalMin(value = "1.00", message = "Minimum top-up amount is ₹1.00")
    private BigDecimal amount;

    private String paymentMethod = "UPI"; // 'UPI', 'CARD'

    public TopUpRequest() {}

    public TopUpRequest(BigDecimal amount) {
        this.amount = amount;
        this.paymentMethod = "UPI";
    }

    public TopUpRequest(BigDecimal amount, String paymentMethod) {
        this.amount = amount;
        this.paymentMethod = paymentMethod != null ? paymentMethod : "UPI";
    }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
}
