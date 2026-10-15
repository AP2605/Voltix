package com.voltix.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "charger")
public class Charger {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "charger_id")
    private Integer chargerId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    private ChargingStation station;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "charger_type_id", nullable = false)
    private ChargerType chargerType;

    @Column(name = "charger_number", nullable = false, length = 20)
    private String chargerNumber;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 'AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'OFFLINE'

    public Charger() {}

    public Charger(ChargingStation station, ChargerType chargerType, String chargerNumber, String status) {
        this.station = station;
        this.chargerType = chargerType;
        this.chargerNumber = chargerNumber;
        this.status = status != null ? status : "AVAILABLE";
    }

    public Integer getChargerId() { return chargerId; }
    public void setChargerId(Integer chargerId) { this.chargerId = chargerId; }

    public ChargingStation getStation() { return station; }
    public void setStation(ChargingStation station) { this.station = station; }

    public ChargerType getChargerType() { return chargerType; }
    public void setChargerType(ChargerType chargerType) { this.chargerType = chargerType; }

    public String getChargerNumber() { return chargerNumber; }
    public void setChargerNumber(String chargerNumber) { this.chargerNumber = chargerNumber; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
