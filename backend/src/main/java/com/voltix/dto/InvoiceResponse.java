package com.voltix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceResponse {

    private Integer sessionId;
    private String invoiceNumber;
    private String userName;
    private String vehicleName;
    private String registrationNumber;
    private String stationName;
    private String chargerNumber;
    private String connectorType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private BigDecimal energyConsumedKwh;
    private BigDecimal ratePerKwh;
    private BigDecimal energyCost;
    private BigDecimal reservationFee;
    private BigDecimal idleFee;
    private BigDecimal discountAmount;
    private BigDecimal finalCost;
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime paymentTime;

    public InvoiceResponse() {}

    public Integer getSessionId() { return sessionId; }
    public void setSessionId(Integer sessionId) { this.sessionId = sessionId; }

    public String getInvoiceNumber() { return invoiceNumber; }
    public void setInvoiceNumber(String invoiceNumber) { this.invoiceNumber = invoiceNumber; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getChargerNumber() { return chargerNumber; }
    public void setChargerNumber(String chargerNumber) { this.chargerNumber = chargerNumber; }

    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public BigDecimal getEnergyConsumedKwh() { return energyConsumedKwh; }
    public void setEnergyConsumedKwh(BigDecimal energyConsumedKwh) { this.energyConsumedKwh = energyConsumedKwh; }

    public BigDecimal getRatePerKwh() { return ratePerKwh; }
    public void setRatePerKwh(BigDecimal ratePerKwh) { this.ratePerKwh = ratePerKwh; }

    public BigDecimal getEnergyCost() { return energyCost; }
    public void setEnergyCost(BigDecimal energyCost) { this.energyCost = energyCost; }

    public BigDecimal getReservationFee() { return reservationFee; }
    public void setReservationFee(BigDecimal reservationFee) { this.reservationFee = reservationFee; }

    public BigDecimal getIdleFee() { return idleFee; }
    public void setIdleFee(BigDecimal idleFee) { this.idleFee = idleFee; }

    public BigDecimal getDiscountAmount() { return discountAmount; }
    public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

    public BigDecimal getFinalCost() { return finalCost; }
    public void setFinalCost(BigDecimal finalCost) { this.finalCost = finalCost; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public LocalDateTime getPaymentTime() { return paymentTime; }
    public void setPaymentTime(LocalDateTime paymentTime) { this.paymentTime = paymentTime; }
}
