package com.voltix.service;

import com.voltix.entity.ChargingSession;
import com.voltix.entity.Reservation;
import com.voltix.repository.ChargerRepository;
import com.voltix.repository.ChargingSessionRepository;
import com.voltix.repository.ReservationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChargingLifecycleScheduler {

    private static final Logger log = LoggerFactory.getLogger(ChargingLifecycleScheduler.class);

    private final ReservationRepository reservationRepository;
    private final ChargingSessionRepository sessionRepository;
    private final ChargerRepository chargerRepository;
    private final ChargingSessionService sessionService;
    private final Clock clock;

    public ChargingLifecycleScheduler(ReservationRepository reservationRepository,
                                      ChargingSessionRepository sessionRepository,
                                      ChargerRepository chargerRepository,
                                      ChargingSessionService sessionService,
                                      Clock clock) {
        this.reservationRepository = reservationRepository;
        this.sessionRepository = sessionRepository;
        this.chargerRepository = chargerRepository;
        this.sessionService = sessionService;
        this.clock = clock;
    }

    /**
     * Correction 2: Auto-cancel reservations if charging does not start within 30 minutes of scheduled start time.
     * Enforces the 30-minute grace period. If now >= startTime + 30m and no session exists, cancel reservation and release charger.
     */
    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void expireUnstartedReservations() {
        LocalDateTime now = LocalDateTime.now(clock);
        LocalDateTime cutoff = now.minusMinutes(30);

        List<Reservation> eligibleReservations = reservationRepository.findEligibleForExpiry(cutoff);
        for (Reservation reservation : eligibleReservations) {
            // Check whether a session has started for this reservation before cancelling
            boolean sessionExists = sessionRepository.existsByReservation_ReservationId(reservation.getReservationId());
            if (sessionExists) {
                log.debug("Reservation #{} has an associated session; skipping auto-expiry cancellation", reservation.getReservationId());
                continue;
            }

            log.info("Auto-cancelled expired reservation #{}: Scheduled start was {}, grace period deadline was {}",
                    reservation.getReservationId(), reservation.getStartTime(), reservation.getStartTime().plusMinutes(30));

            reservation.setStatus("CANCELLED");
            reservationRepository.save(reservation);

            if (reservation.getCharger() != null && "RESERVED".equalsIgnoreCase(reservation.getCharger().getStatus())) {
                reservation.getCharger().setStatus("AVAILABLE");
                chargerRepository.save(reservation.getCharger());
                log.info("Released charger #{} back to AVAILABLE from auto-cancelled reservation #{}",
                        reservation.getCharger().getChargerId(), reservation.getReservationId());
            }
        }
    }

    /**
     * Correction 4: Auto-stop charging sessions that have reached or exceeded their full booked duration.
     * Booked duration = reservation.endTime - reservation.startTime.
     * Expected end time = session.startTime + bookedDuration.
     * If now >= expectedEndTime, automatically conclude the session.
     */
    @Scheduled(fixedDelay = 30000)
    @Transactional
    public void autoStopElapsedSessions() {
        LocalDateTime now = LocalDateTime.now(clock);
        List<ChargingSession> activeSessions = sessionRepository.findActiveSessionsWithReservation();

        for (ChargingSession session : activeSessions) {
            try {
                long bookedMinutes = 120; // default 2 hours if instant booking without formal reservation
                if (session.getReservation() != null) {
                    LocalDateTime resStart = session.getReservation().getStartTime();
                    LocalDateTime resEnd = session.getReservation().getEndTime();
                    if (resStart != null && resEnd != null) {
                        long diff = Duration.between(resStart, resEnd).toMinutes();
                        if (diff > 0) {
                            bookedMinutes = diff;
                        }
                    }
                }

                LocalDateTime expectedEndTime = session.getStartTime().plusMinutes(bookedMinutes);
                if (!now.isBefore(expectedEndTime)) {
                    log.info("Auto-stopping elapsed charging session #{}: start={}, bookedDuration={}m, expectedEnd={}, now={}",
                            session.getSessionId(), session.getStartTime(), bookedMinutes, expectedEndTime, now);
                    sessionService.autoStopSession(session.getSessionId());
                }
            } catch (Exception e) {
                log.error("Failed to auto-stop session #{}: {}", session.getSessionId(), e.getMessage(), e);
            }
        }
    }
}