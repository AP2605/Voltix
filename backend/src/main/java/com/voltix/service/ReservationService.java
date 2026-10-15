package com.voltix.service;

import com.voltix.dto.ReservationRequest;
import com.voltix.dto.ReservationResponse;
import com.voltix.entity.Charger;
import com.voltix.entity.Reservation;
import com.voltix.entity.Vehicle;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ForbiddenException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.ChargerRepository;
import com.voltix.repository.ReservationRepository;
import com.voltix.repository.StoredProcedureRepository;
import com.voltix.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReservationService {

    private static final Logger log = LoggerFactory.getLogger(ReservationService.class);

    private final ReservationRepository reservationRepository;
    private final StoredProcedureRepository storedProcedureRepository;
    private final VehicleRepository vehicleRepository;
    private final ChargerRepository chargerRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              StoredProcedureRepository storedProcedureRepository,
                              VehicleRepository vehicleRepository,
                              ChargerRepository chargerRepository) {
        this.reservationRepository = reservationRepository;
        this.storedProcedureRepository = storedProcedureRepository;
        this.vehicleRepository = vehicleRepository;
        this.chargerRepository = chargerRepository;
    }

    @Transactional
    public ReservationResponse createReservation(Integer userId, ReservationRequest request) {
        // 1. Vehicle ownership validation
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));

        if (!vehicle.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("Vehicle does not belong to the authenticated user");
        }

        // 2. Chronological interval validation
        if (request.getStartTime().isAfter(request.getEndTime()) || request.getStartTime().isEqual(request.getEndTime())) {
            throw new BadRequestException("Reservation start time must be strictly before end time");
        }

        if (request.getStartTime().isBefore(LocalDateTime.now().minusMinutes(10))) {
            throw new BadRequestException("Reservation start time cannot be in the past");
        }

        // 3. Charger existence check
        Charger charger = chargerRepository.findById(request.getChargerId())
                .orElseThrow(() -> new ResourceNotFoundException("Charger", "id", request.getChargerId()));

        // 4. Invoke ACID-compliant reserve_charger stored procedure with row-level locking
        StoredProcedureRepository.ProcedureResult result = storedProcedureRepository.reserveCharger(
                userId,
                request.getVehicleId(),
                request.getChargerId(),
                request.getStartTime(),
                request.getEndTime()
        );

        log.info("reserve_charger procedure executed: status={}, code={}, message={}",
                result.statusCode(), result.id(), result.message());

        if ("SLOT_OVERLAP".equals(result.statusCode())) {
            throw new ConflictException("Charger already has a conflicting reservation for the selected time slot");
        }

        if ("CHARGER_UNAVAILABLE".equals(result.statusCode())) {
            throw new ConflictException("Charger is currently out of service or under maintenance");
        }

        if (!"SUCCESS".equals(result.statusCode()) || result.id() == null) {
            throw new BadRequestException("Reservation failed: " + result.message());
        }

        Reservation reservation = reservationRepository.findById(result.id())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", result.id()));

        return mapToDto(reservation);
    }

    @Transactional(readOnly = true)
    public List<ReservationResponse> getUserReservations(Integer userId) {
        return reservationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ReservationResponse getReservationById(Integer userId, Integer reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if (!reservation.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this reservation");
        }

        return mapToDto(reservation);
    }

    @Transactional
    public ReservationResponse cancelReservation(Integer userId, Integer reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", reservationId));

        if (!reservation.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to cancel this reservation");
        }

        if ("CANCELLED".equalsIgnoreCase(reservation.getStatus())) {
            throw new BadRequestException("Reservation is already cancelled");
        }

        if ("COMPLETED".equalsIgnoreCase(reservation.getStatus()) || "ACTIVE".equalsIgnoreCase(reservation.getStatus())) {
            throw new BadRequestException("Cannot cancel a reservation that is already " + reservation.getStatus().toLowerCase());
        }

        reservation.setStatus("CANCELLED");
        reservation = reservationRepository.save(reservation);

        // Database trigger trg_reservation_cancelled_release_charger automatically
        // releases the charger status back to 'AVAILABLE' if it was 'RESERVED'.

        log.info("Reservation cancelled: id={}, userId={}", reservationId, userId);
        return mapToDto(reservation);
    }

    public ReservationResponse mapToDto(Reservation r) {
        Charger ch = r.getCharger();
        Vehicle v = r.getVehicle();
        String vehicleLabel = v != null
                ? v.getModel().getManufacturer() + " " + v.getModel().getModelName() + " (" + v.getRegistrationNumber() + ")"
                : "EV Vehicle";

        return new ReservationResponse(
                r.getReservationId(),
                r.getUser().getUserId(),
                v != null ? v.getVehicleId() : null,
                vehicleLabel,
                ch.getStation().getStationId(),
                ch.getStation().getStationName(),
                ch.getChargerId(),
                ch.getChargerNumber(),
                ch.getChargerType().getConnectorType() + " (" + ch.getChargerType().getPowerRating() + " kW)",
                r.getStartTime(),
                r.getEndTime(),
                new BigDecimal("50.00"), // Base reservation hold fee
                r.getStatus(),
                r.getCreatedAt()
        );
    }
}
