package com.voltix.dto;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReservationRequest {

    @NotNull(message = "Vehicle ID is required")
    private Integer vehicleId;

    private Integer stationId;

    @NotNull(message = "Charger ID is required")
    private Integer chargerId;

    @NotNull(message = "Reservation start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "Reservation end time is required")
    private LocalDateTime endTime;

    private BigDecimal estimatedCost;

    public ReservationRequest() {}

    public ReservationRequest(Integer vehicleId, Integer chargerId, LocalDateTime startTime, LocalDateTime endTime) {
        this.vehicleId = vehicleId;
        this.chargerId = chargerId;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public ReservationRequest(Integer vehicleId, Integer stationId, Integer chargerId, LocalDateTime startTime, LocalDateTime endTime, BigDecimal estimatedCost) {
        this.vehicleId = vehicleId;
        this.stationId = stationId;
        this.chargerId = chargerId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.estimatedCost = estimatedCost;
    }

    public Integer getVehicleId() { return vehicleId; }
    public void setVehicleId(Integer vehicleId) { this.vehicleId = vehicleId; }

    public Integer getStationId() { return stationId; }
    public void setStationId(Integer stationId) { this.stationId = stationId; }

    public Integer getChargerId() { return chargerId; }
    public void setChargerId(Integer chargerId) { this.chargerId = chargerId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getEstimatedCost() { return estimatedCost; }
    public void setEstimatedCost(BigDecimal estimatedCost) { this.estimatedCost = estimatedCost; }
}
