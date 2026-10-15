package com.voltix.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "charger_type")
public class ChargerType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "charger_type_id")
    private Integer chargerTypeId;

    @Column(name = "connector_type", nullable = false, length = 50)
    private String connectorType;

    @Column(name = "power_rating", nullable = false, precision = 6, scale = 2)
    private BigDecimal powerRating;

    public ChargerType() {}

    public ChargerType(String connectorType, BigDecimal powerRating) {
        this.connectorType = connectorType;
        this.powerRating = powerRating;
    }

    public Integer getChargerTypeId() { return chargerTypeId; }
    public void setChargerTypeId(Integer chargerTypeId) { this.chargerTypeId = chargerTypeId; }

    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }

    public BigDecimal getPowerRating() { return powerRating; }
    public void setPowerRating(BigDecimal powerRating) { this.powerRating = powerRating; }
}
