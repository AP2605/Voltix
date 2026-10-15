package com.voltix.service;

import com.voltix.dto.ReservationRequest;
import com.voltix.dto.ReservationResponse;
import com.voltix.entity.*;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ForbiddenException;
import com.voltix.repository.ChargerRepository;
import com.voltix.repository.ReservationRepository;
import com.voltix.repository.StoredProcedureRepository;
import com.voltix.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private StoredProcedureRepository storedProcedureRepository;

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private ChargerRepository chargerRepository;

    @InjectMocks
    private ReservationService reservationService;

    private User owner;
    private Vehicle vehicle;
    private Charger charger;

    @BeforeEach
    void setUp() {
        owner = new User("Rahul Sharma", "rahul@example.com", "+919876543210", "hash", "USER", "ACTIVE");
        owner.setUserId(1);

        VehicleModel model = new VehicleModel("Tata", "Nexon EV", new BigDecimal("40.50"), new BigDecimal("50.00"));
        model.setModelId(1);

        vehicle = new Vehicle(owner, model, "MH01AB1234", new BigDecimal("80.00"));
        vehicle.setVehicleId(10);

        City city = new City("Mumbai", "Maharashtra");
        ChargingStation station = new ChargingStation(city, owner, "Bandra Fast Hub",
                new BigDecimal("19.0596"), new BigDecimal("72.8295"), "Bandra West", "OPERATIONAL");
        station.setStationId(100);

        ChargerType type = new ChargerType("CCS2", new BigDecimal("50.00"));
        charger = new Charger(station, type, "CH-01", "AVAILABLE");
        charger.setChargerId(200);
    }

    @Test
    void createReservation_VehicleOwnershipMismatch_ThrowsForbidden() {
        User otherUser = new User("Other", "other@example.com", "+919876543211", "hash", "USER", "ACTIVE");
        otherUser.setUserId(2);
        vehicle.setUser(otherUser);

        when(vehicleRepository.findById(10)).thenReturn(Optional.of(vehicle));

        ReservationRequest req = new ReservationRequest(
                10,
                200,
                LocalDateTime.now().plusHours(1),
                LocalDateTime.now().plusHours(2)
        );

        assertThrows(ForbiddenException.class, () -> reservationService.createReservation(1, req));
    }

    @Test
    void createReservation_EndTimeBeforeStartTime_ThrowsBadRequest() {
        when(vehicleRepository.findById(10)).thenReturn(Optional.of(vehicle));

        ReservationRequest req = new ReservationRequest(
                10,
                200,
                LocalDateTime.now().plusHours(2),
                LocalDateTime.now().plusHours(1)
        );

        assertThrows(BadRequestException.class, () -> reservationService.createReservation(1, req));
    }

    @Test
    void createReservation_SlotOverlap_ThrowsConflictException() {
        when(vehicleRepository.findById(10)).thenReturn(Optional.of(vehicle));
        when(chargerRepository.findById(200)).thenReturn(Optional.of(charger));

        LocalDateTime start = LocalDateTime.now().plusHours(1);
        LocalDateTime end = LocalDateTime.now().plusHours(2);

        when(storedProcedureRepository.reserveCharger(eq(1), eq(10), eq(200), any(), any()))
                .thenReturn(new StoredProcedureRepository.ProcedureResult(null, "SLOT_OVERLAP", "Slot conflict", null));

        ReservationRequest req = new ReservationRequest(10, 200, start, end);

        assertThrows(ConflictException.class, () -> reservationService.createReservation(1, req));
    }

    @Test
    void createReservation_Success_ReturnsReservationResponse() {
        when(vehicleRepository.findById(10)).thenReturn(Optional.of(vehicle));
        when(chargerRepository.findById(200)).thenReturn(Optional.of(charger));

        LocalDateTime start = LocalDateTime.now().plusHours(1);
        LocalDateTime end = LocalDateTime.now().plusHours(2);

        when(storedProcedureRepository.reserveCharger(eq(1), eq(10), eq(200), any(), any()))
                .thenReturn(new StoredProcedureRepository.ProcedureResult(500, "SUCCESS", "Reserved successfully", null));

        Reservation savedReservation = new Reservation(owner, vehicle, charger, start, end, "CONFIRMED");
        savedReservation.setReservationId(500);

        when(reservationRepository.findById(500)).thenReturn(Optional.of(savedReservation));

        ReservationRequest req = new ReservationRequest(10, 200, start, end);
        ReservationResponse resp = reservationService.createReservation(1, req);

        assertNotNull(resp);
        assertEquals(500, resp.getReservationId());
        assertEquals("CONFIRMED", resp.getStatus());
    }

    @Test
    void cancelReservation_Success_FlipsStatusToCancelled() {
        Reservation reservation = new Reservation(owner, vehicle, charger,
                LocalDateTime.now().plusHours(1), LocalDateTime.now().plusHours(2), "CONFIRMED");
        reservation.setReservationId(500);

        when(reservationRepository.findById(500)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any(Reservation.class))).thenAnswer(i -> i.getArguments()[0]);

        ReservationResponse resp = reservationService.cancelReservation(1, 500);

        assertEquals("CANCELLED", resp.getStatus());
        verify(reservationRepository, times(1)).save(reservation);
    }
}
