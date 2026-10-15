package com.voltix.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class OperatorDashboardResponse {

    private Integer totalStations;
    private Integer totalChargers;
    private Integer occupiedChargers;
    private Integer availableChargers;
    private Integer maintenanceChargers;
    private Integer activeTickets;
    private BigDecimal utilizationPercentage;
    private List<StationResponse> stations = new ArrayList<>();
    private List<MaintenanceResponse> maintenanceRequests = new ArrayList<>();

    public OperatorDashboardResponse() {}

    public Integer getTotalStations() { return totalStations; }
    public void setTotalStations(Integer totalStations) { this.totalStations = totalStations; }

    public Integer getTotalChargers() { return totalChargers; }
    public void setTotalChargers(Integer totalChargers) { this.totalChargers = totalChargers; }

    public Integer getOccupiedChargers() { return occupiedChargers; }
    public void setOccupiedChargers(Integer occupiedChargers) { this.occupiedChargers = occupiedChargers; }

    public Integer getAvailableChargers() { return availableChargers; }
    public void setAvailableChargers(Integer availableChargers) { this.availableChargers = availableChargers; }

    public Integer getMaintenanceChargers() { return maintenanceChargers; }
    public void setMaintenanceChargers(Integer maintenanceChargers) { this.maintenanceChargers = maintenanceChargers; }

    public Integer getActiveTickets() { return activeTickets; }
    public void setActiveTickets(Integer activeTickets) { this.activeTickets = activeTickets; }

    public BigDecimal getUtilizationPercentage() { return utilizationPercentage; }
    public void setUtilizationPercentage(BigDecimal utilizationPercentage) { this.utilizationPercentage = utilizationPercentage; }

    public List<StationResponse> getStations() { return stations; }
    public void setStations(List<StationResponse> stations) { this.stations = stations; }

    public List<MaintenanceResponse> getMaintenanceRequests() { return maintenanceRequests; }
    public void setMaintenanceRequests(List<MaintenanceResponse> maintenanceRequests) { this.maintenanceRequests = maintenanceRequests; }
}
