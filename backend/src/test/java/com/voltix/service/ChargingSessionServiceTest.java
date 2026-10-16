package com.voltix.service;

import com.voltix.dto.StartSessionRequest;
import com.voltix.entity.*;
import com.voltix.exception.ConflictException;
import com.voltix.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChargingSessionServiceTest {

    @Mock
    private ChargingSessionRepository sessionRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ChargerRepository chargerRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private MeterReadingRepository meterReadingRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private StoredProcedureRepository storedProcedureRepository;

    private Clock fixedClock;
    private ChargingSessionService service;

    private final LocalDateTime fixedNow = LocalDateTime.of(2026, 10, 15, 10, 20, 0); // 10:20 AM

    @BeforeEach
    void setUp() {
        ZoneId zone = ZoneId.of("Asia/Kolkata");
        Instant instant = fixedNow.atZone(zone).toInstant();
        fixedClock = Clock.fixed(instant, zone);

        service = new ChargingSessionService(
                sessionRepository,
                reservationRepository,
                chargerRepository,
                vehicleRepository,
                meterReadingRepository,
                paymentRepository,
                storedProcedureRepository,
                fixedClock
        );
    }

    @Test
    void testStartSession_Within30MinGracePeriod_Succeeds() {
        // Scheduled: 10:00 to 11:00. Now is 10:20 (20 mins past start, within 30m grace)
        User user = new User();
        user.setUserId(1);

        VehicleModel model = new VehicleModel("Tata", "Nexon EV", new BigDecimal("40.50"), new BigDecimal("50.00"));
        Vehicle vehicle = new Vehicle(user, model, "MH01AB1234", new BigDecimal("50.00"));
        vehicle.setVehicleId(10);

        ChargingStation station = new ChargingStation();
        ChargerType type = new ChargerType("CCS2", new BigDecimal("50.00"));
        Charger charger = new Charger(station, type, "CHG-01", "RESERVED");

        Reservation reservation = new Reservation(user, vehicle, charger,
                LocalDateTime.of(2026, 10, 15, 10, 0, 0),
                LocalDateTime.of(2026, 10, 15, 11, 0, 0),
                "CONFIRMED");
        reservation.setReservationId(5);

        when(sessionRepository.findTopByVehicle_User_UserIdAndEndTimeIsNullOrderByStartTimeDesc(1))
                .thenReturn(Optional.empty());
        when(reservationRepository.findById(5)).thenReturn(Optional.of(reservation));
        when(storedProcedureRepository.startCharging(5))
                .thenReturn(new StoredProcedureRepository.ProcedureResult(100, "SUCCESS", "Started", BigDecimal.ZERO));

        ChargingSession createdSession = new ChargingSession(reservation, charger, vehicle);
        createdSession.setSessionId(100);
        createdSession.setStartTime(fixedNow);
        when(sessionRepository.findById(100)).thenReturn(Optional.of(createdSession));

        StartSessionRequest request = new StartSessionRequest();
        request.setReservationId(5);

        var response = service.startSession(1, request);
        org.junit.jupiter.api.Assertions.assertNotNull(response);
        org.junit.jupiter.api.Assertions.assertEquals(100, response.getSessionId());
        verify(storedProcedureRepository, times(1)).startCharging(5);
    }

    @Test
    void testStartSession_Past30MinGracePeriod_RejectsAndCancelsReservation() {
        // Scheduled: 09:30 to 10:30. Now is 10:20 (50 mins past start, grace deadline was 10:00)
        User user = new User();
        user.setUserId(1);

        ChargingStation station = new ChargingStation();
        ChargerType type = new ChargerType("CCS2", new BigDecimal("50.00"));
        Charger charger = new Charger(station, type, "CHG-01", "RESERVED");

        Reservation reservation = new Reservation(user, new Vehicle(), charger,
                LocalDateTime.of(2026, 10, 15, 9, 30, 0),
                LocalDateTime.of(2026, 10, 15, 10, 30, 0),
                "CONFIRMED");
        reservation.setReservationId(8);

        when(sessionRepository.findTopByVehicle_User_UserIdAndEndTimeIsNullOrderByStartTimeDesc(1))
                .thenReturn(Optional.empty());
        when(reservationRepository.findById(8)).thenReturn(Optional.of(reservation));

        StartSessionRequest request = new StartSessionRequest();
        request.setReservationId(8);

        ConflictException ex = assertThrows(ConflictException.class, () -> service.startSession(1, request));
        assertTrue(ex.getMessage().contains("grace period"));
        org.junit.jupiter.api.Assertions.assertEquals("CANCELLED", reservation.getStatus());
        org.junit.jupiter.api.Assertions.assertEquals("AVAILABLE", charger.getStatus());

        verify(reservationRepository, times(1)).save(reservation);
        verify(chargerRepository, times(1)).save(charger);
        verify(storedProcedureRepository, never()).startCharging(anyInt());
    }
}