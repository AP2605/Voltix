package com.voltix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;

@Entity
@Immutable
@Table(name = "station_revenue")
public class StationRevenueView {

    @Id
    @Column(name = "station_id")
    private Integer stationId;

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "city_name")
    private String cityName;

    @Column(name = "state")
    private String state;

    @Column(name = "station_status")
    private String stationStatus;

    @Column(name = "total_sessions")
    private Long totalSessions;

    @Column(name = "total_energy_kwh")
    private BigDecimal totalEnergyKwh;

    @Column(name = "total_revenue_inr")
    private BigDecimal totalRevenueInr;

    @Column(name = "avg_session_cost_inr")
    private BigDecimal avgSessionCostInr;

    public StationRevenueView() {}

    public Integer getStationId() { return stationId; }
    public String getStationName() { return stationName; }
    public String getCityName() { return cityName; }
    public String getState() { return state; }
    public String getStationStatus() { return stationStatus; }
    public Long getTotalSessions() { return totalSessions; }
    public BigDecimal getTotalEnergyKwh() { return totalEnergyKwh; }
    public BigDecimal getTotalRevenueInr() { return totalRevenueInr; }
    public BigDecimal getAvgSessionCostInr() { return avgSessionCostInr; }
}
