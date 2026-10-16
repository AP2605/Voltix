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

        User owner = session.getVehicle() != null ? session.getVehicle().getUser() : (session.getReservation() != null ? session.getReservation().getUser() : null);
        if (owner != null && !owner.getUserId().equals(userId)) {
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

        Integer ownerId = null;
        if (session.getVehicle() != null && session.getVehicle().getUser() != null) {
            ownerId = session.getVehicle().getUser().getUserId();
        } else if (session.getReservation() != null && session.getReservation().getUser() != null) {
            ownerId = session.getReservation().getUser().getUserId();
        }

        if (ownerId != null && !ownerId.equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this invoice");
        }

        InvoiceResponse invoice = new InvoiceResponse();
        invoice.setSessionId(session.getSessionId());
        invoice.setInvoiceNumber("INV-2026-" + String.format("%06d", session.getSessionId()));

        String userName = "Voltix Driver";
        String vehicleName = "Registered EV";
        String regNumber = "—";
        if (session.getVehicle() != null) {
            if (session.getVehicle().getUser() != null && session.getVehicle().getUser().getName() != null) {
                userName = session.getVehicle().getUser().getName();
            }
            if (session.getVehicle().getModel() != null) {
                vehicleName = session.getVehicle().getModel().getManufacturer() + " " + session.getVehicle().getModel().getModelName();
            }
            if (session.getVehicle().getRegistrationNumber() != null) {
                regNumber = session.getVehicle().getRegistrationNumber();
            }
        } else if (session.getReservation() != null && session.getReservation().getUser() != null && session.getReservation().getUser().getName() != null) {
            userName = session.getReservation().getUser().getName();
        }
        invoice.setUserName(userName);
        invoice.setVehicleName(vehicleName);
        invoice.setRegistrationNumber(regNumber);

        String stationName = "Voltix Superhub";
        String stationAddress = "Voltix Charging Bay";
        String chargerNumber = "BAY-01";
        String connectorType = "CCS2";
        BigDecimal rate = new BigDecimal("14.00");

        if (session.getCharger() != null) {
            chargerNumber = session.getCharger().getChargerNumber() != null ? session.getCharger().getChargerNumber() : chargerNumber;
            if (session.getCharger().getStation() != null) {
                stationName = session.getCharger().getStation().getStationName() != null ? session.getCharger().getStation().getStationName() : stationName;
                stationAddress = session.getCharger().getStation().getAddress() != null ? session.getCharger().getStation().getAddress() : stationAddress;
            }
            if (session.getCharger().getChargerType() != null) {
                connectorType = session.getCharger().getChargerType().getConnectorType() != null ? session.getCharger().getChargerType().getConnectorType() : connectorType;
                if (session.getCharger().getChargerType().getPowerRating() != null && session.getCharger().getChargerType().getPowerRating().compareTo(new BigDecimal("50")) > 0) {
                    rate = new BigDecimal("17.50");
                }
            }
        }

        invoice.setStationName(stationName);
        invoice.setStationAddress(stationAddress);
        invoice.setChargerNumber(chargerNumber);
        invoice.setConnectorType(connectorType);
        invoice.setRatePerKwh(rate);

        invoice.setStartTime(session.getStartTime());
        invoice.setEndTime(session.getEndTime());
        int duration = session.getDurationMinutes() != null ? session.getDurationMinutes() : 0;
        invoice.setDurationMinutes(duration);

        BigDecimal energy = session.getEnergyConsumed() != null ? session.getEnergyConsumed() : BigDecimal.ZERO;
        invoice.setEnergyConsumedKwh(energy);

        BigDecimal energyCost = energy.multiply(rate).setScale(2, RoundingMode.HALF_UP);
        invoice.setEnergyCost(energyCost);

        BigDecimal reservationFee = session.getReservation() != null ? new BigDecimal("50.00") : BigDecimal.ZERO;
        invoice.setReservationFee(reservationFee);

        BigDecimal idleFee = duration > 90
                ? BigDecimal.valueOf(duration - 90).multiply(new BigDecimal("2.50"))
                : BigDecimal.ZERO;
        invoice.setIdleFee(idleFee);

        invoice.setDiscountAmount(BigDecimal.ZERO);
        BigDecimal sessionFinalCost = session.getFinalCost() != null ? session.getFinalCost() : BigDecimal.ZERO;
        BigDecimal billTotal = sessionFinalCost.compareTo(BigDecimal.ZERO) > 0
                ? sessionFinalCost
                : energyCost.add(reservationFee).add(idleFee);
        invoice.setFinalCost(billTotal);

        invoice.setReservationId(session.getReservation() != null ? session.getReservation().getReservationId() : null);

        Optional<Payment> payment = paymentRepository.findBySession_SessionId(sessionId);
        if (payment.isPresent()) {
            Payment p = payment.get();
            invoice.setPaymentStatus(p.getPaymentStatus());
            invoice.setPaymentMethod(p.getPaymentMethod());
            invoice.setPaymentTime(p.getPaymentTime());
            invoice.setTransactionReference("VX-TXN-" + String.format("%06d", p.getPaymentId()));

            if ("SUCCESS".equalsIgnoreCase(p.getPaymentStatus())) {
                BigDecimal paid = p.getAmount() != null ? p.getAmount() : billTotal;
                invoice.setAmountPaid(paid);
                BigDecimal balanceRemaining = billTotal.subtract(paid);
                invoice.setOutstandingAmount(balanceRemaining.compareTo(BigDecimal.ZERO) > 0 ? balanceRemaining : BigDecimal.ZERO);
            } else {
                invoice.setAmountPaid(BigDecimal.ZERO);
                invoice.setOutstandingAmount(billTotal);
            }
        } else {
            invoice.setPaymentStatus("UNPAID");
            invoice.setPaymentMethod(null);
            invoice.setPaymentTime(null);
            invoice.setTransactionReference(null);
            invoice.setAmountPaid(BigDecimal.ZERO);
            invoice.setOutstandingAmount(billTotal);
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
