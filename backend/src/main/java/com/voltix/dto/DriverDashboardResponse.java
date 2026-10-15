package com.voltix.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class DriverDashboardResponse {

    private BigDecimal walletBalance;
    private Double monthlyEnergyKwh;
    private Integer co2OffsetKg;
    private Integer completedChargesCount;
    private ChargingSessionResponse activeSession;
    private List<VehicleResponse> vehicles = new ArrayList<>();
    private List<ReservationResponse> recentReservations = new ArrayList<>();
    private List<ChargingSessionResponse> recentSessions = new ArrayList<>();
    private List<StationResponse> nearbyStations = new ArrayList<>();

    public DriverDashboardResponse() {}

    public BigDecimal getWalletBalance() { return walletBalance; }
    public void setWalletBalance(BigDecimal walletBalance) { this.walletBalance = walletBalance; }

    public Double getMonthlyEnergyKwh() { return monthlyEnergyKwh; }
    public void setMonthlyEnergyKwh(Double monthlyEnergyKwh) { this.monthlyEnergyKwh = monthlyEnergyKwh; }

    public Integer getCo2OffsetKg() { return co2OffsetKg; }
    public void setCo2OffsetKg(Integer co2OffsetKg) { this.co2OffsetKg = co2OffsetKg; }

    public Integer getCompletedChargesCount() { return completedChargesCount; }
    public void setCompletedChargesCount(Integer completedChargesCount) { this.completedChargesCount = completedChargesCount; }

    public ChargingSessionResponse getActiveSession() { return activeSession; }
    public void setActiveSession(ChargingSessionResponse activeSession) { this.activeSession = activeSession; }

    public List<VehicleResponse> getVehicles() { return vehicles; }
    public void setVehicles(List<VehicleResponse> vehicles) { this.vehicles = vehicles; }

    public List<ReservationResponse> getRecentReservations() { return recentReservations; }
    public void setRecentReservations(List<ReservationResponse> recentReservations) { this.recentReservations = recentReservations; }

    public List<ChargingSessionResponse> getRecentSessions() { return recentSessions; }
    public void setRecentSessions(List<ChargingSessionResponse> recentSessions) { this.recentSessions = recentSessions; }

    public List<StationResponse> getNearbyStations() { return nearbyStations; }
    public void setNearbyStations(List<StationResponse> nearbyStations) { this.nearbyStations = nearbyStations; }
}
