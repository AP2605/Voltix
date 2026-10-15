package com.voltix.controller;

import com.voltix.dto.InvoiceResponse;
import com.voltix.dto.PaymentResponse;
import com.voltix.dto.ProcessPaymentRequest;
import com.voltix.security.SecurityUtils;
import com.voltix.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payments & Billing", description = "ACID payment processing, wallet debits, and invoice generation")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @Operation(summary = "Process session payment via WALLET, UPI, or CARD (stored procedure & row-level locking)")
    public ResponseEntity<PaymentResponse> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        PaymentResponse response = paymentService.processPayment(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Retrieve payment transaction receipts for the authenticated user")
    public ResponseEntity<List<PaymentResponse>> getMyPayments() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<PaymentResponse> payments = paymentService.getUserPayments(userId);
        return ResponseEntity.ok(payments);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve details for a specific payment receipt")
    public ResponseEntity<PaymentResponse> getPaymentById(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        PaymentResponse payment = paymentService.getPaymentById(userId, id);
        return ResponseEntity.ok(payment);
    }

    @GetMapping("/invoice/{sessionId}")
    @Operation(summary = "Generate and retrieve a detailed tax invoice for a concluded charging session")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable("sessionId") Integer sessionId) {
        Integer userId = SecurityUtils.getCurrentUserId();
        InvoiceResponse invoice = paymentService.getInvoice(userId, sessionId);
        return ResponseEntity.ok(invoice);
    }
}
