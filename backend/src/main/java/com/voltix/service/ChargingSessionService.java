package com.voltix.service;

import com.voltix.dto.ChargingSessionResponse;
import com.voltix.dto.MeterReadingResponse;
import com.voltix.dto.StartSessionRequest;
import com.voltix.entity.*;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ForbiddenException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ChargingSessionService {

    private static final Logger log = LoggerFactory.getLogger(ChargingSessionService.class);

    private final ChargingSessionRepository sessionRepository;
    private final ReservationRepository reservationRepository;
    private final ChargerRepository chargerRepository;
    private final VehicleRepository vehicleRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final PaymentRepository paymentRepository;
    private final StoredProcedureRepository storedProcedureRepository;
    private final Clock clock;

    public ChargingSessionService(ChargingSessionRepository sessionRepository,
                                  ReservationRepository reservationRepository,
                                  ChargerRepository chargerRepository,
                                  VehicleRepository vehicleRepository,
                                  MeterReadingRepository meterReadingRepository,
                                  PaymentRepository paymentRepository,
                                  StoredProcedureRepository storedProcedureRepository,
                                  Clock clock) {
        this.sessionRepository = sessionRepository;
        this.reservationRepository = reservationRepository;
        this.chargerRepository = chargerRepository;
        this.vehicleRepository = vehicleRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.paymentRepository = paymentRepository;
        this.storedProcedureRepository = storedProcedureRepository;
        this.clock = clock;
    }

    @Transactional(noRollbackFor = ConflictException.class)
    public ChargingSessionResponse startSession(Integer userId, StartSessionRequest request) {
        // Prevent multiple concurrent active charging sessions per driver
        Optional<ChargingSession> activeSession = sessionRepository.findTopByVehicle_User_UserIdAndEndTimeIsNullOrderByStartTimeDesc(userId);
        if (activeSession.isPresent()) {
            throw new ConflictException("You already have an active charging session in progress (Session #" +
                    activeSession.get().getSessionId() + ")");
        }

        Integer reservationId = request.getReservationId();

        // If no advance reservation was provided, create an immediate booking
        if (reservationId == null) {
            if (request.getVehicleId() == null || request.getChargerId() == null) {
                throw new BadRequestException("Either a reservationId or both vehicleId and chargerId must be provided");
            }

            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", request.getVehicleId()));
            if (!vehicle.getUser().getUserId().equals(userId)) {
                throw new ForbiddenException("Vehicle does not belong to the authenticated user");
            }
            if ("DELETED".equalsIgnoreCase(vehicle.getStatus())) {
                throw new BadRequestException("Selected vehicle has been removed from your garage");
            }

            LocalDateTime now = LocalDateTime.now(clock);
            LocalDateTime endSlot = now.plusHours(2);

            StoredProcedureRepository.ProcedureResult resResult = storedProcedureRepository.reserveCharger(
                    userId,
                    request.getVehicleId(),
                    request.getChargerId(),
                    now,
                    endSlot
            );

            if (!"SUCCESS".equals(resResult.statusCode()) || resResult.id() == null) {
                throw new ConflictException("Could not initiate instant session: " + resResult.message());
            }

            reservationId = resResult.id();
        } else {
            // Verify ownership of existing reservation
            final Integer existingResId = reservationId;
            Reservation reservation = reservationRepository.findById(existingResId)
                    .orElseThrow(() -> new ResourceNotFoundException("Reservation", "id", existingResId));

            if (!reservation.getUser().getUserId().equals(userId)) {
                throw new ForbiddenException("Reservation does not belong to the authenticated user");
            }

            // Verify reservation has not been cancelled, completed, or expired
            String resStatus = reservation.getStatus() != null ? reservation.getStatus().toUpperCase() : "CONFIRMED";
            if ("CANCELLED".equals(resStatus) || "EXPIRED".equals(resStatus)) {
                throw new ConflictException("Cannot start charging: Reservation #" + reservationId + " is " + resStatus + ".");
            }
            if ("COMPLETED".equals(resStatus)) {
                throw new ConflictException("Cannot start charging: Reservation #" + reservationId + " is already completed.");
            }

            // Enforce authoritative 30-minute grace period from reservation scheduled start time
            LocalDateTime now = LocalDateTime.now(clock);
            LocalDateTime graceDeadline = reservation.getStartTime().plusMinutes(30);

            if (now.isAfter(graceDeadline) || now.isEqual(graceDeadline)) {
                // Automatically mark reservation CANCELLED and release charger if reserved
                reservation.setStatus("CANCELLED");
                reservationRepository.save(reservation);

                if ("RESERVED".equalsIgnoreCase(reservation.getCharger().getStatus())) {
                    reservation.getCharger().setStatus("AVAILABLE");
                    chargerRepository.save(reservation.getCharger());
                }

                log.warn("Rejected start charging for expired reservation #{}: start_time={}, deadline={}, current_time={}",
                        reservationId, reservation.getStartTime(), graceDeadline, now);

                throw new ConflictException("Cannot start charging: Reservation #" + reservationId +
                        " expired because charging was not initiated within the 30-minute grace period (grace deadline was " +
                        graceDeadline + ").");
            }
        }

        // Invoke ACID start_charging stored procedure
        StoredProcedureRepository.ProcedureResult startResult = storedProcedureRepository.startCharging(reservationId);

        log.info("start_charging procedure executed: status={}, sessionId={}, message={}",
                startResult.statusCode(), startResult.id(), startResult.message());

        if ("SESSION_ALREADY_EXISTS".equals(startResult.statusCode())) {
            throw new ConflictException("A charging session has already been started for this reservation");
        }

        if (!"SUCCESS".equals(startResult.statusCode()) || startResult.id() == null) {
            throw new BadRequestException("Failed to start charging: " + startResult.message());
        }

        ChargingSession session = sessionRepository.findById(startResult.id())
                .orElseThrow(() -> new ResourceNotFoundException("ChargingSession", "id", startResult.id()));

        return mapToDto(session);
    }

    @Transactional(readOnly = true)
    public ChargingSessionResponse getActiveSession(Integer userId) {
        return sessionRepository.findTopByVehicle_User_UserIdAndEndTimeIsNullOrderByStartTimeDesc(userId)
                .map(this::mapToDto)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public ChargingSessionResponse getSessionById(Integer userId, Integer sessionId) {
        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChargingSession", "id", sessionId));

        if (!session.getVehicle().getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this charging session");
        }

        return mapToDto(session);
    }

    @Transactional
    public ChargingSessionResponse endSession(Integer userId, Integer sessionId) {
        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChargingSession", "id", sessionId));

        if (!session.getVehicle().getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to terminate this session");
        }

        if (session.getEndTime() != null) {
            throw new BadRequestException("This charging session has already been ended");
        }

        // Add telemetry meter readings prior to concluding the session if only baseline existed
        long readingCount = meterReadingRepository.findBySession_SessionIdOrderByReadingTimeAsc(sessionId).size();
        if (readingCount <= 1) {
            LocalDateTime start = session.getStartTime();
            LocalDateTime end = LocalDateTime.now();
            long minutes = Math.max(1, Duration.between(start, end).toMinutes());
            BigDecimal powerKw = session.getCharger().getChargerType().getPowerRating();

            // Simulate realistic telemetry for active demo session
            BigDecimal calculatedKwh = powerKw.multiply(BigDecimal.valueOf(minutes))
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("0.90"));

            MeterReading finalReading = new MeterReading(
                    session,
                    new BigDecimal("415.00"),
                    new BigDecimal("32.50"),
                    calculatedKwh
            );
            meterReadingRepository.save(finalReading);
        }

        // Invoke ACID end_charging procedure
        StoredProcedureRepository.ProcedureResult endResult = storedProcedureRepository.endCharging(sessionId);

        log.info("end_charging procedure executed: status={}, cost={}, message={}",
                endResult.statusCode(), endResult.amount(), endResult.message());

        if (!"SUCCESS".equals(endResult.statusCode()) && !"ALREADY_COMPLETED".equals(endResult.statusCode())) {
            throw new BadRequestException("Failed to conclude session: " + endResult.message());
        }

        // Reload updated session from database
        ChargingSession updatedSession = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChargingSession", "id", sessionId));

        return mapToDto(updatedSession);
    }

    @Transactional
    public ChargingSessionResponse autoStopSession(Integer sessionId) {
        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChargingSession", "id", sessionId));

        if (session.getEndTime() != null) {
            log.info("autoStopSession: Session #{} already concluded, skipping", sessionId);
            return mapToDto(session);
        }

        // Add telemetry meter readings prior to concluding the session if only baseline existed
        long readingCount = meterReadingRepository.findBySession_SessionIdOrderByReadingTimeAsc(sessionId).size();
        if (readingCount <= 1) {
            LocalDateTime start = session.getStartTime();
            LocalDateTime end = LocalDateTime.now(clock);
            long minutes = Math.max(1, Duration.between(start, end).toMinutes());
            BigDecimal powerKw = session.getCharger().getChargerType().getPowerRating();

            BigDecimal calculatedKwh = powerKw.multiply(BigDecimal.valueOf(minutes))
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("0.90"));

            MeterReading finalReading = new MeterReading(
                    session,
                    new BigDecimal("415.00"),
                    new BigDecimal("32.50"),
                    calculatedKwh
            );
            meterReadingRepository.save(finalReading);
        }

        // Invoke ACID end_charging procedure
        StoredProcedureRepository.ProcedureResult endResult = storedProcedureRepository.endCharging(sessionId);

        log.info("autoStopSession: end_charging procedure executed: status={}, cost={}, message={}",
                endResult.statusCode(), endResult.amount(), endResult.message());

        ChargingSession updatedSession = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChargingSession", "id", sessionId));

        return mapToDto(updatedSession);
    }

    @Transactional(readOnly = true)
    public List<ChargingSessionResponse> getUserSessions(Integer userId) {
        return sessionRepository.findByVehicle_User_UserIdOrderByStartTimeDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MeterReadingResponse> getSessionReadings(Integer sessionId) {
        return meterReadingRepository.findBySession_SessionIdOrderByReadingTimeAsc(sessionId).stream()
                .map(r -> new MeterReadingResponse(
                        r.getReadingId(),
                        sessionId,
                        r.getReadingTime(),
                        r.getVoltage(),
                        r.getCurrent(),
                        r.getEnergyKwh()
                ))
                .collect(Collectors.toList());
    }

    public ChargingSessionResponse mapToResponse(ChargingSession s) {
        return mapToDto(s);
    }

    public ChargingSessionResponse mapToDto(ChargingSession s) {
        Charger ch = s.getCharger();
        ChargingStation st = ch.getStation();
        Vehicle v = s.getVehicle();

        ChargingSessionResponse dto = new ChargingSessionResponse();
        dto.setSessionId(s.getSessionId());
        dto.setReservationId(s.getReservation() != null ? s.getReservation().getReservationId() : null);
        dto.setUserId(v.getUser().getUserId());
        dto.setVehicleId(v.getVehicleId());
        dto.setVehicleName(v.getModel().getManufacturer() + " " + v.getModel().getModelName());
        dto.setRegistrationNumber(v.getRegistrationNumber());
        dto.setStationId(st.getStationId());
        dto.setStationName(st.getStationName());
        dto.setAddress(st.getAddress());
        dto.setChargerId(ch.getChargerId());
        dto.setChargerNumber(ch.getChargerNumber());
        dto.setConnectorType(ch.getChargerType().getConnectorType());
        dto.setPowerKw(ch.getChargerType().getPowerRating());
        dto.setPricePerKwh(ch.getChargerType().getPowerRating().compareTo(new BigDecimal("50")) > 0
                ? new BigDecimal("17.50") : new BigDecimal("14.00"));
        dto.setStartTime(s.getStartTime());
        dto.setEndTime(s.getEndTime());
        dto.setDurationMinutes(s.getDurationMinutes());
        dto.setEnergyConsumedKwh(s.getEnergyConsumed());
        dto.setFinalCost(s.getFinalCost());
        dto.setStatus(s.getEndTime() == null ? "CHARGING" : "COMPLETED");

        // Authoritative Booked Duration & Expected Stop Deadline derived from reservation
        if (s.getReservation() != null && s.getReservation().getStartTime() != null && s.getReservation().getEndTime() != null) {
            long bookedMin = Duration.between(s.getReservation().getStartTime(), s.getReservation().getEndTime()).toMinutes();
            dto.setBookedDurationMinutes((int) bookedMin);
            if (s.getStartTime() != null) {
                dto.setExpectedEndTime(s.getStartTime().plusMinutes(bookedMin));
            }
        } else if (s.getStartTime() != null) {
            dto.setBookedDurationMinutes(60);
            dto.setExpectedEndTime(s.getStartTime().plusHours(1));
        }

        // Payment status lookup
        Optional<Payment> payment = paymentRepository.findBySession_SessionId(s.getSessionId());
        if (payment.isPresent()) {
            dto.setPaymentStatus(payment.get().getPaymentStatus());
            dto.setPaymentMethod(payment.get().getPaymentMethod());
        } else {
            dto.setPaymentStatus(s.getEndTime() == null ? "PENDING" : "UNPAID");
            dto.setPaymentMethod(null);
        }

        // Live telemetry calculations for active sessions
        if (s.getEndTime() == null) {
            long elapsedMin = Math.max(1, Duration.between(s.getStartTime(), LocalDateTime.now(clock)).toMinutes());
            dto.setDurationMinutes((int) elapsedMin);

            BigDecimal powerKw = ch.getChargerType().getPowerRating();
            BigDecimal liveEnergy = powerKw.multiply(BigDecimal.valueOf(elapsedMin))
                    .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("0.90"));
            dto.setEnergyConsumedKwh(liveEnergy);

            BigDecimal rate = dto.getPricePerKwh();
            dto.setFinalCost(liveEnergy.multiply(rate).setScale(2, RoundingMode.HALF_UP));

            dto.setCurrentVoltage(new BigDecimal("400.00"));
            dto.setCurrentAmperes(new BigDecimal("32.00"));

            double startSoc = v.getBatteryPercentage().doubleValue();
            double addedSoc = (liveEnergy.doubleValue() / v.getModel().getBatteryCapacity().doubleValue()) * 100.0;
            dto.setCurrentBatteryPercentage(BigDecimal.valueOf(Math.min(100.0, Math.round(startSoc + addedSoc))));
        } else {
            dto.setCurrentBatteryPercentage(v.getBatteryPercentage());
        }

        return dto;
    }
}
