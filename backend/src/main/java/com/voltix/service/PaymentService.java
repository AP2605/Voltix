package com.voltix.service;

import com.voltix.dto.InvoiceResponse;
import com.voltix.dto.PaymentResponse;
import com.voltix.dto.ProcessPaymentRequest;
import com.voltix.entity.ChargingSession;
import com.voltix.entity.Payment;
import com.voltix.entity.User;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ForbiddenException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.ChargingSessionRepository;
import com.voltix.repository.PaymentRepository;
import com.voltix.repository.StoredProcedureRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final ChargingSessionRepository sessionRepository;
    private final StoredProcedureRepository storedProcedureRepository;

    public PaymentService(PaymentRepository paymentRepository,
                          ChargingSessionRepository sessionRepository,
                          StoredProcedureRepository storedProcedureRepository) {
        this.paymentRepository = paymentRepository;
        this.sessionRepository = sessionRepository;
        this.storedProcedureRepository = storedProcedureRepository;
    }

    @Transactional
    public PaymentResponse processPayment(Integer userId, ProcessPaymentRequest request) {
        // 1. Validate session and ownership
        ChargingSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("ChargingSession", "id", request.getSessionId()));

        User owner = session.getVehicle().getUser();
        if (!owner.getUserId().equals(userId)) {
            throw new ForbiddenException("You cannot settle payment for another user's charging session");
        }

        // 2. Prevent duplicate settlement
        Optional<Payment> existingPayment = paymentRepository.findBySession_SessionId(session.getSessionId());
        if (existingPayment.isPresent() && "SUCCESS".equalsIgnoreCase(existingPayment.get().getPaymentStatus())) {
            throw new ConflictException("Charging session #" + session.getSessionId() + " has already been settled");
        }

        String method = request.getPaymentMethod().trim().toUpperCase();
        if (!List.of("WALLET", "UPI", "CARD").contains(method)) {
            throw new BadRequestException("Invalid payment method. Allowed: WALLET, UPI, CARD");
        }

        // 3. Execute ACID process_payment stored procedure with row-locking
        StoredProcedureRepository.ProcedureResult result = storedProcedureRepository.processPayment(
                session.getSessionId(),
                userId,
                method
        );

        log.info("process_payment procedure executed: status={}, paymentId={}, message={}",
                result.statusCode(), result.id(), result.message());

        if ("INSUFFICIENT_BALANCE".equals(result.statusCode())) {
            throw new BadRequestException(result.message());
        }

        if ("ALREADY_PAID".equals(result.statusCode())) {
            throw new ConflictException(result.message());
        }

        if (!"SUCCESS".equals(result.statusCode()) || result.id() == null) {
            throw new BadRequestException("Payment settlement failed: " + result.message());
        }

        Payment payment = paymentRepository.findById(result.id())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", result.id()));

        return mapToDto(payment);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoice(Integer userId, Integer sessionId) {
        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("ChargingSession", "id", sessionId));

        if (!session.getVehicle().getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this invoice");
        }

        InvoiceResponse invoice = new InvoiceResponse();
        invoice.setSessionId(session.getSessionId());
        invoice.setInvoiceNumber("INV-2026-" + String.format("%06d", session.getSessionId()));
        invoice.setUserName(session.getVehicle().getUser().getName());
        invoice.setVehicleName(session.getVehicle().getModel().getManufacturer() + " " + session.getVehicle().getModel().getModelName());
        invoice.setRegistrationNumber(session.getVehicle().getRegistrationNumber());
        invoice.setStationName(session.getCharger().getStation().getStationName());
        invoice.setChargerNumber(session.getCharger().getChargerNumber());
        invoice.setConnectorType(session.getCharger().getChargerType().getConnectorType());
        invoice.setStartTime(session.getStartTime());
        invoice.setEndTime(session.getEndTime());
        invoice.setDurationMinutes(session.getDurationMinutes());
        invoice.setEnergyConsumedKwh(session.getEnergyConsumed());

        BigDecimal rate = session.getCharger().getChargerType().getPowerRating().compareTo(new BigDecimal("50")) > 0
                ? new BigDecimal("17.50") : new BigDecimal("14.00");
        invoice.setRatePerKwh(rate);

        BigDecimal energyCost = session.getEnergyConsumed().multiply(rate).setScale(2, RoundingMode.HALF_UP);
        invoice.setEnergyCost(energyCost);

        BigDecimal reservationFee = session.getReservation() != null ? new BigDecimal("50.00") : BigDecimal.ZERO;
        invoice.setReservationFee(reservationFee);

        BigDecimal idleFee = session.getDurationMinutes() > 90
                ? BigDecimal.valueOf(session.getDurationMinutes() - 90).multiply(new BigDecimal("2.50"))
                : BigDecimal.ZERO;
        invoice.setIdleFee(idleFee);

        invoice.setDiscountAmount(BigDecimal.ZERO);
        invoice.setFinalCost(session.getFinalCost().compareTo(BigDecimal.ZERO) > 0 ? session.getFinalCost() : energyCost.add(reservationFee));

        Optional<Payment> payment = paymentRepository.findBySession_SessionId(sessionId);
        if (payment.isPresent()) {
            invoice.setPaymentStatus(payment.get().getPaymentStatus());
            invoice.setPaymentMethod(payment.get().getPaymentMethod());
            invoice.setPaymentTime(payment.get().getPaymentTime());
        } else {
            invoice.setPaymentStatus("UNPAID");
            invoice.setPaymentMethod(null);
            invoice.setPaymentTime(null);
        }

        return invoice;
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Integer userId, Integer paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));
        if (!payment.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this payment");
        }
        return mapToDto(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getUserPayments(Integer userId) {
        return paymentRepository.findByUser_UserIdOrderByPaymentTimeDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToDto(Payment p) {
        return new PaymentResponse(
                p.getPaymentId(),
                p.getSession().getSessionId(),
                p.getUser().getUserId(),
                p.getAmount(),
                p.getPaymentMethod(),
                p.getPaymentStatus(),
                p.getPaymentTime(),
                "VX-TXN-" + String.format("%06d", p.getPaymentId())
        );
    }
}
