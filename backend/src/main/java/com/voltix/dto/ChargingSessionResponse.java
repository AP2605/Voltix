package com.voltix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ChargingSessionResponse {

    private Integer sessionId;
    private Integer reservationId;
    private Integer userId;
    private Integer vehicleId;
    private String vehicleName;
    private String registrationNumber;
    private Integer stationId;
    private String stationName;
    private String address;
    private Integer chargerId;
    private String chargerNumber;
    private String connectorType;
    private BigDecimal powerKw;
    private BigDecimal pricePerKwh;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Integer durationMinutes;
    private BigDecimal energyConsumedKwh;
    private BigDecimal finalCost;
    private String status; // 'CHARGING', 'COMPLETED'
    private String paymentStatus; // 'PENDING', 'SUCCESS', 'UNPAID'
    private String paymentMethod;
    private BigDecimal currentVoltage;
    private BigDecimal currentAmperes;
    private BigDecimal currentBatteryPercentage;

    public ChargingSessionResponse() {}

    public Integer getSessionId() { return sessionId; }
    public void setSessionId(Integer sessionId) { this.sessionId = sessionId; }

    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getVehicleId() { return vehicleId; }
    public void setVehicleId(Integer vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public Integer getStationId() { return stationId; }
    public void setStationId(Integer stationId) { this.stationId = stationId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Integer getChargerId() { return chargerId; }
    public void setChargerId(Integer chargerId) { this.chargerId = chargerId; }

    public String getChargerNumber() { return chargerNumber; }
    public void setChargerNumber(String chargerNumber) { this.chargerNumber = chargerNumber; }

    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }

    public BigDecimal getPowerKw() { return powerKw; }
    public void setPowerKw(BigDecimal powerKw) { this.powerKw = powerKw; }

    public BigDecimal getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(BigDecimal pricePerKwh) { this.pricePerKwh = pricePerKwh; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public BigDecimal getEnergyConsumedKwh() { return energyConsumedKwh; }
    public void setEnergyConsumedKwh(BigDecimal energyConsumedKwh) { this.energyConsumedKwh = energyConsumedKwh; }

    public BigDecimal getFinalCost() { return finalCost; }
    public void setFinalCost(BigDecimal finalCost) { this.finalCost = finalCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public BigDecimal getCurrentVoltage() { return currentVoltage; }
    public void setCurrentVoltage(BigDecimal currentVoltage) { this.currentVoltage = currentVoltage; }

    public BigDecimal getCurrentAmperes() { return currentAmperes; }
    public void setCurrentAmperes(BigDecimal currentAmperes) { this.currentAmperes = currentAmperes; }

    public BigDecimal getCurrentBatteryPercentage() { return currentBatteryPercentage; }
    public void setCurrentBatteryPercentage(BigDecimal currentBatteryPercentage) { this.currentBatteryPercentage = currentBatteryPercentage; }
}
