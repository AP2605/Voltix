package com.voltix.service;

import com.voltix.dto.InvoiceResponse;
import com.voltix.dto.PaymentResponse;
import com.voltix.dto.ProcessPaymentRequest;
import com.voltix.entity.*;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ForbiddenException;
import com.voltix.repository.ChargingSessionRepository;
import com.voltix.repository.PaymentRepository;
import com.voltix.repository.StoredProcedureRepository;
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
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ChargingSessionRepository sessionRepository;

    @Mock
    private StoredProcedureRepository storedProcedureRepository;

    @InjectMocks
    private PaymentService paymentService;

    private User driver;
    private ChargingSession session;

    @BeforeEach
    void setUp() {
        driver = new User("Priya Patel", "priya@example.com", "+919876543220", "hash", "USER", "ACTIVE");
        driver.setUserId(5);

        VehicleModel model = new VehicleModel("MG", "ZS EV", new BigDecimal("50.30"), new BigDecimal("60.00"));
        Vehicle vehicle = new Vehicle(driver, model, "MH02CD5678", new BigDecimal("90.00"));
        vehicle.setVehicleId(15);

        City city = new City("Pune", "Maharashtra");
        ChargingStation station = new ChargingStation(city, driver, "Pune EV Park",
                new BigDecimal("18.5300"), new BigDecimal("73.8500"), "Shivajinagar", "OPERATIONAL");

        ChargerType type = new ChargerType("CCS2", new BigDecimal("60.00"));
        Charger charger = new Charger(station, type, "CH-02", "IN_USE");

        session = new ChargingSession(null, charger, vehicle);
        session.setSessionId(300);
        session.setStartTime(LocalDateTime.now().minusHours(1));
        session.setEndTime(LocalDateTime.now());
        session.setDurationMinutes(60);
        session.setEnergyConsumed(new BigDecimal("28.50"));
        session.setFinalCost(new BigDecimal("498.75"));
    }

    @Test
    void processPayment_OtherUserSession_ThrowsForbiddenException() {
        when(sessionRepository.findById(300)).thenReturn(Optional.of(session));

        ProcessPaymentRequest req = new ProcessPaymentRequest(300, "WALLET");

        assertThrows(ForbiddenException.class, () -> paymentService.processPayment(999, req));
    }

    @Test
    void processPayment_AlreadyPaid_ThrowsConflictException() {
        when(sessionRepository.findById(300)).thenReturn(Optional.of(session));

        Payment existingPayment = new Payment(session, driver, new BigDecimal("498.75"), "WALLET", "SUCCESS");
        when(paymentRepository.findBySession_SessionId(300)).thenReturn(Optional.of(existingPayment));

        ProcessPaymentRequest req = new ProcessPaymentRequest(300, "WALLET");

        assertThrows(ConflictException.class, () -> paymentService.processPayment(5, req));
    }

    @Test
    void processPayment_InvalidMethod_ThrowsBadRequestException() {
        when(sessionRepository.findById(300)).thenReturn(Optional.of(session));
        when(paymentRepository.findBySession_SessionId(300)).thenReturn(Optional.empty());

        ProcessPaymentRequest req = new ProcessPaymentRequest(300, "BITCOIN");

        assertThrows(BadRequestException.class, () -> paymentService.processPayment(5, req));
    }

    @Test
    void processPayment_Success_ReturnsPaymentResponse() {
        when(sessionRepository.findById(300)).thenReturn(Optional.of(session));
        when(paymentRepository.findBySession_SessionId(300)).thenReturn(Optional.empty());

        when(storedProcedureRepository.processPayment(eq(300), eq(5), eq("WALLET")))
                .thenReturn(new StoredProcedureRepository.ProcedureResult(777, "SUCCESS", "Payment processed successfully", null));

        Payment payment = new Payment(session, driver, new BigDecimal("498.75"), "WALLET", "SUCCESS");
        payment.setPaymentId(777);
        payment.setPaymentTime(LocalDateTime.now());

        when(paymentRepository.findById(777)).thenReturn(Optional.of(payment));

        ProcessPaymentRequest req = new ProcessPaymentRequest(300, "WALLET");
        PaymentResponse resp = paymentService.processPayment(5, req);

        assertNotNull(resp);
        assertEquals(777, resp.getPaymentId());
        assertEquals("SUCCESS", resp.getPaymentStatus());
        assertEquals("WALLET", resp.getPaymentMethod());
    }

    @Test
    void getInvoice_Success_CalculatesInvoiceBreakdown() {
        when(sessionRepository.findById(300)).thenReturn(Optional.of(session));
        when(paymentRepository.findBySession_SessionId(300)).thenReturn(Optional.empty());

        InvoiceResponse inv = paymentService.getInvoice(5, 300);

        assertNotNull(inv);
        assertEquals(300, inv.getSessionId());
        assertEquals("Priya Patel", inv.getUserName());
        assertEquals("UNPAID", inv.getPaymentStatus());
        assertTrue(inv.getFinalCost().compareTo(BigDecimal.ZERO) > 0);
    }
}
