package com.voltix.dto;

import com.voltix.entity.ChargerHealthView;
import com.voltix.entity.StationRevenueView;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class AdminDashboardResponse {

    private Long totalUsers;
    private Long totalStations;
    private Long totalChargers;
    private Long activeChargers;
    private Long activeSessionsCount;
    private Long completedSessionsCount;
    private BigDecimal totalEnergyDeliveredKwh;
    private BigDecimal totalRevenueInr;
    private Double co2AvoidedTons;
    private List<StationRevenueView> stationRevenues = new ArrayList<>();
    private List<ChargerHealthView> chargerHealths = new ArrayList<>();
    private List<ChargingSessionResponse> recentSessions = new ArrayList<>();

    public AdminDashboardResponse() {}

    public Long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(Long totalUsers) { this.totalUsers = totalUsers; }

    public Long getTotalStations() { return totalStations; }
    public void setTotalStations(Long totalStations) { this.totalStations = totalStations; }

    public Long getTotalChargers() { return totalChargers; }
    public void setTotalChargers(Long totalChargers) { this.totalChargers = totalChargers; }

    public Long getActiveChargers() { return activeChargers; }
    public void setActiveChargers(Long activeChargers) { this.activeChargers = activeChargers; }

    public Long getActiveSessionsCount() { return activeSessionsCount; }
    public void setActiveSessionsCount(Long activeSessionsCount) { this.activeSessionsCount = activeSessionsCount; }

    public Long getCompletedSessionsCount() { return completedSessionsCount; }
    public void setCompletedSessionsCount(Long completedSessionsCount) { this.completedSessionsCount = completedSessionsCount; }

    public BigDecimal getTotalEnergyDeliveredKwh() { return totalEnergyDeliveredKwh; }
    public void setTotalEnergyDeliveredKwh(BigDecimal totalEnergyDeliveredKwh) { this.totalEnergyDeliveredKwh = totalEnergyDeliveredKwh; }

    public BigDecimal getTotalRevenueInr() { return totalRevenueInr; }
    public void setTotalRevenueInr(BigDecimal totalRevenueInr) { this.totalRevenueInr = totalRevenueInr; }

    public Double getCo2AvoidedTons() { return co2AvoidedTons; }
    public void setCo2AvoidedTons(Double co2AvoidedTons) { this.co2AvoidedTons = co2AvoidedTons; }

    public List<StationRevenueView> getStationRevenues() { return stationRevenues; }
    public void setStationRevenues(List<StationRevenueView> stationRevenues) { this.stationRevenues = stationRevenues; }

    public List<ChargerHealthView> getChargerHealths() { return chargerHealths; }
    public void setChargerHealths(List<ChargerHealthView> chargerHealths) { this.chargerHealths = chargerHealths; }

    public List<ChargingSessionResponse> getRecentSessions() { return recentSessions; }
    public void setRecentSessions(List<ChargingSessionResponse> recentSessions) { this.recentSessions = recentSessions; }
}
