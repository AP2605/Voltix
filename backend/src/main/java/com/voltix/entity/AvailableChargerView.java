package com.voltix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;

@Entity
@Immutable
@Table(name = "available_chargers")
public class AvailableChargerView {

    @Id
    @Column(name = "charger_id")
    private Integer chargerId;

    @Column(name = "station_id")
    private Integer stationId;

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "city_name")
    private String cityName;

    @Column(name = "state")
    private String state;

    @Column(name = "address")
    private String address;

    @Column(name = "latitude")
    private BigDecimal latitude;

    @Column(name = "longitude")
    private BigDecimal longitude;

    @Column(name = "charger_number")
    private String chargerNumber;

    @Column(name = "connector_type")
    private String connectorType;

    @Column(name = "power_kw")
    private BigDecimal powerKw;

    @Column(name = "charger_status")
    private String chargerStatus;

    @Column(name = "base_price_per_kwh")
    private BigDecimal basePricePerKwh;

    public AvailableChargerView() {}

    public Integer getChargerId() { return chargerId; }
    public Integer getStationId() { return stationId; }
    public String getStationName() { return stationName; }
    public String getCityName() { return cityName; }
    public String getState() { return state; }
    public String getAddress() { return address; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public String getChargerNumber() { return chargerNumber; }
    public String getConnectorType() { return connectorType; }
    public BigDecimal getPowerKw() { return powerKw; }
    public String getChargerStatus() { return chargerStatus; }
    public BigDecimal getBasePricePerKwh() { return basePricePerKwh; }
}
