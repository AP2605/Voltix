package com.voltix.controller;

import com.voltix.dto.ChargingSessionResponse;
import com.voltix.dto.MeterReadingResponse;
import com.voltix.dto.StartSessionRequest;
import com.voltix.security.SecurityUtils;
import com.voltix.service.ChargingSessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/charging-sessions")
@Tag(name = "Charging Sessions", description = "Real-time session lifecycle orchestration and telemetry data")
public class ChargingSessionController {

    private final ChargingSessionService sessionService;
    private final com.voltix.service.PaymentService paymentService;

    public ChargingSessionController(ChargingSessionService sessionService, com.voltix.service.PaymentService paymentService) {
        this.sessionService = sessionService;
        this.paymentService = paymentService;
    }

    @PostMapping("/start")
    @Operation(summary = "Initiate an active charging session (hardware lock engaged)")
    public ResponseEntity<ChargingSessionResponse> startSession(@Valid @RequestBody StartSessionRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        ChargingSessionResponse session = sessionService.startSession(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(session);
    }

    @GetMapping("/active")
    @Operation(summary = "Retrieve driver's current live session with real-time telemetry if present")
    public ResponseEntity<ChargingSessionResponse> getActiveSession() {
        Integer userId = SecurityUtils.getCurrentUserId();
        ChargingSessionResponse session = sessionService.getActiveSession(userId);
        return ResponseEntity.ok(session);
    }

    @GetMapping
    @Operation(summary = "Retrieve charging history for the authenticated driver")
    public ResponseEntity<List<ChargingSessionResponse>> getMySessions() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<ChargingSessionResponse> sessions = sessionService.getUserSessions(userId);
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve detailed metrics and invoice status for a single charging session")
    public ResponseEntity<ChargingSessionResponse> getSessionById(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        ChargingSessionResponse session = sessionService.getSessionById(userId, id);
        return ResponseEntity.ok(session);
    }

    @PostMapping("/{id}/stop")
    @Operation(summary = "Conclude an active session, compute final energy & cost, and free hardware")
    public ResponseEntity<ChargingSessionResponse> stopSession(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        ChargingSessionResponse session = sessionService.endSession(userId, id);
        return ResponseEntity.ok(session);
    }

    @GetMapping("/{id}/readings")
    @Operation(summary = "Retrieve periodic voltage, amperage, and energy telemetry logs")
    public ResponseEntity<List<MeterReadingResponse>> getSessionReadings(@PathVariable("id") Integer id) {
        List<MeterReadingResponse> readings = sessionService.getSessionReadings(id);
        return ResponseEntity.ok(readings);
    }

    @GetMapping("/{id}/invoice")
    @Operation(summary = "Retrieve tax invoice for a concluded charging session")
    public ResponseEntity<com.voltix.dto.InvoiceResponse> getInvoice(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(paymentService.getInvoice(userId, id));
    }
}
