package com.voltix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "charger_health")
public class ChargerHealthView {

    @Id
    @Column(name = "charger_id")
    private Integer chargerId;

    @Column(name = "charger_number")
    private String chargerNumber;

    @Column(name = "station_id")
    private Integer stationId;

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "city_name")
    private String cityName;

    @Column(name = "connector_type")
    private String connectorType;

    @Column(name = "power_kw")
    private BigDecimal powerKw;

    @Column(name = "current_hardware_status")
    private String currentHardwareStatus;

    @Column(name = "total_maintenance_requests")
    private Long totalMaintenanceRequests;

    @Column(name = "active_open_issues")
    private BigDecimal activeOpenIssues;

    @Column(name = "last_maintenance_date")
    private LocalDateTime lastMaintenanceDate;

    @Column(name = "total_maintenance_cost_inr")
    private BigDecimal totalMaintenanceCostInr;

    public ChargerHealthView() {}

    public Integer getChargerId() { return chargerId; }
    public String getChargerNumber() { return chargerNumber; }
    public Integer getStationId() { return stationId; }
    public String getStationName() { return stationName; }
    public String getCityName() { return cityName; }
    public String getConnectorType() { return connectorType; }
    public BigDecimal getPowerKw() { return powerKw; }
    public String getCurrentHardwareStatus() { return currentHardwareStatus; }
    public Long getTotalMaintenanceRequests() { return totalMaintenanceRequests; }
    public BigDecimal getActiveOpenIssues() { return activeOpenIssues; }
    public LocalDateTime getLastMaintenanceDate() { return lastMaintenanceDate; }
    public BigDecimal getTotalMaintenanceCostInr() { return totalMaintenanceCostInr; }
}
