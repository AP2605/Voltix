package com.voltix.service;

import com.voltix.entity.*;
import com.voltix.repository.ChargerRepository;
import com.voltix.repository.ChargingSessionRepository;
import com.voltix.repository.ReservationRepository;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChargingLifecycleSchedulerTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ChargingSessionRepository sessionRepository;

    @Mock
    private ChargerRepository chargerRepository;

    @Mock
    private ChargingSessionService sessionService;

    private Clock fixedClock;
    private ChargingLifecycleScheduler scheduler;

    private final LocalDateTime fixedNow = LocalDateTime.of(2026, 10, 15, 11, 0, 0);

    @BeforeEach
    void setUp() {
        ZoneId zone = ZoneId.of("Asia/Kolkata");
        Instant instant = fixedNow.atZone(zone).toInstant();
        fixedClock = Clock.fixed(instant, zone);

        scheduler = new ChargingLifecycleScheduler(
                reservationRepository,
                sessionRepository,
                chargerRepository,
                sessionService,
                fixedClock
        );
    }

    @Test
    void testExpireUnstartedReservations_CancelsWhenNoSession() {
        // Scheduled start was 10:00 (more than 30 mins before fixedNow 11:00)
        LocalDateTime scheduledStart = LocalDateTime.of(2026, 10, 15, 10, 0, 0);
        LocalDateTime scheduledEnd = LocalDateTime.of(2026, 10, 15, 11, 0, 0);

        ChargingStation station = new ChargingStation();
        ChargerType type = new ChargerType("CCS2", new BigDecimal("50.00"));
        Charger charger = new Charger(station, type, "CHG-01", "RESERVED");
        charger.setChargerId(101);

        Reservation res = new Reservation(new User(), new Vehicle(), charger, scheduledStart, scheduledEnd, "CONFIRMED");
        res.setReservationId(42);

        when(reservationRepository.findEligibleForExpiry(any(LocalDateTime.class)))
                .thenReturn(List.of(res));
        when(sessionRepository.existsByReservation_ReservationId(42))
                .thenReturn(false);

        scheduler.expireUnstartedReservations();

        assertEquals("CANCELLED", res.getStatus());
        assertEquals("AVAILABLE", charger.getStatus());
        verify(reservationRepository, times(1)).save(res);
        verify(chargerRepository, times(1)).save(charger);
    }

    @Test
    void testExpireUnstartedReservations_SkipsWhenSessionExists() {
        LocalDateTime scheduledStart = LocalDateTime.of(2026, 10, 15, 10, 0, 0);
        LocalDateTime scheduledEnd = LocalDateTime.of(2026, 10, 15, 11, 0, 0);

        Reservation res = new Reservation(new User(), new Vehicle(), new Charger(), scheduledStart, scheduledEnd, "CONFIRMED");
        res.setReservationId(99);

        when(reservationRepository.findEligibleForExpiry(any(LocalDateTime.class)))
                .thenReturn(List.of(res));
        when(sessionRepository.existsByReservation_ReservationId(99))
                .thenReturn(true);

        scheduler.expireUnstartedReservations();

        assertEquals("CONFIRMED", res.getStatus());
        verify(reservationRepository, never()).save(any());
        verify(chargerRepository, never()).save(any());
    }

    @Test
    void testAutoStopElapsedSessions_ConcludesElapsedSession() {
        // Booked duration: 10:00 to 11:00 (60 mins)
        // Started charging at 10:20 -> Expected end time is 11:20
        // If fixedNow is 11:30, it is past 11:20 -> autoStop must trigger!
        LocalDateTime scheduledStart = LocalDateTime.of(2026, 10, 15, 10, 0, 0);
        LocalDateTime scheduledEnd = LocalDateTime.of(2026, 10, 15, 11, 0, 0);
        Reservation res = new Reservation(new User(), new Vehicle(), new Charger(), scheduledStart, scheduledEnd, "CONFIRMED");

        LocalDateTime actualStart = LocalDateTime.of(2026, 10, 15, 10, 20, 0);
        ChargingSession session = new ChargingSession(res, new Charger(), new Vehicle());
        session.setSessionId(77);
        session.setStartTime(actualStart);
        session.setEndTime(null);

        // Advance clock to 11:30
        ZoneId zone = ZoneId.of("Asia/Kolkata");
        Instant instant = LocalDateTime.of(2026, 10, 15, 11, 30, 0).atZone(zone).toInstant();
        Clock advancedClock = Clock.fixed(instant, zone);
        scheduler = new ChargingLifecycleScheduler(reservationRepository, sessionRepository, chargerRepository, sessionService, advancedClock);

        when(sessionRepository.findActiveSessionsWithReservation()).thenReturn(List.of(session));

        scheduler.autoStopElapsedSessions();

        verify(sessionService, times(1)).autoStopSession(77);
    }

    @Test
    void testAutoStopElapsedSessions_DoesNotStopBeforeExpectedEndTime() {
        // Booked duration: 10:00 to 11:00 (60 mins)
        // Started charging at 10:20 -> Expected end time is 11:20
        // Current time is 11:00 -> STILL WITHIN 60-min granted duration!
        LocalDateTime scheduledStart = LocalDateTime.of(2026, 10, 15, 10, 0, 0);
        LocalDateTime scheduledEnd = LocalDateTime.of(2026, 10, 15, 11, 0, 0);
        Reservation res = new Reservation(new User(), new Vehicle(), new Charger(), scheduledStart, scheduledEnd, "CONFIRMED");

        LocalDateTime actualStart = LocalDateTime.of(2026, 10, 15, 10, 20, 0);
        ChargingSession session = new ChargingSession(res, new Charger(), new Vehicle());
        session.setSessionId(88);
        session.setStartTime(actualStart);
        session.setEndTime(null);

        when(sessionRepository.findActiveSessionsWithReservation()).thenReturn(List.of(session));

        scheduler.autoStopElapsedSessions();

        verify(sessionService, never()).autoStopSession(anyInt());
    }
}