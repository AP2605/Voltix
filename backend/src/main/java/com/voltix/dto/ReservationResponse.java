package com.voltix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReservationResponse {

    private Integer reservationId;
    private Integer userId;
    private Integer vehicleId;
    private String vehicleName;
    private Integer stationId;
    private String stationName;
    private Integer chargerId;
    private String chargerNumber;
    private String connectorType;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal estimatedCost;
    private String status;
    private LocalDateTime createdAt;

    public ReservationResponse() {}

    public ReservationResponse(Integer reservationId, Integer userId, Integer vehicleId, String vehicleName,
                               Integer stationId, String stationName, Integer chargerId, String chargerNumber,
                               String connectorType, LocalDateTime startTime, LocalDateTime endTime,
                               BigDecimal estimatedCost, String status, LocalDateTime createdAt) {
        this.reservationId = reservationId;
        this.userId = userId;
        this.vehicleId = vehicleId;
        this.vehicleName = vehicleName;
        this.stationId = stationId;
        this.stationName = stationName;
        this.chargerId = chargerId;
        this.chargerNumber = chargerNumber;
        this.connectorType = connectorType;
        this.startTime = startTime;
        this.endTime = endTime;
        this.estimatedCost = estimatedCost;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getVehicleId() { return vehicleId; }
    public void setVehicleId(Integer vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public Integer getStationId() { return stationId; }
    public void setStationId(Integer stationId) { this.stationId = stationId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public Integer getChargerId() { return chargerId; }
    public void setChargerId(Integer chargerId) { this.chargerId = chargerId; }

    public String getChargerNumber() { return chargerNumber; }
    public void setChargerNumber(String chargerNumber) { this.chargerNumber = chargerNumber; }

    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
