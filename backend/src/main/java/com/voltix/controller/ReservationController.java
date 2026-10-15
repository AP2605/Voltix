package com.voltix.controller;

import com.voltix.dto.ReservationRequest;
import com.voltix.dto.ReservationResponse;
import com.voltix.security.SecurityUtils;
import com.voltix.service.ReservationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
@Tag(name = "Reservations", description = "ACID-compliant charger slot booking and cancellation engine")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    @Operation(summary = "Book an exclusive charging slot (backed by reserve_charger stored procedure & row locks)")
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody ReservationRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        ReservationResponse response = reservationService.createReservation(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Retrieve all reservations booked by the authenticated driver")
    public ResponseEntity<List<ReservationResponse>> getMyReservations() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<ReservationResponse> reservations = reservationService.getUserReservations(userId);
        return ResponseEntity.ok(reservations);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve details for a specific reservation")
    public ResponseEntity<ReservationResponse> getReservationById(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        ReservationResponse reservation = reservationService.getReservationById(userId, id);
        return ResponseEntity.ok(reservation);
    }

    @PostMapping("/{id}/cancel")
    @Operation(summary = "Cancel an upcoming reservation and trigger automated charger slot release")
    public ResponseEntity<ReservationResponse> cancelReservation(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        ReservationResponse response = reservationService.cancelReservation(userId, id);
        return ResponseEntity.ok(response);
    }
}
