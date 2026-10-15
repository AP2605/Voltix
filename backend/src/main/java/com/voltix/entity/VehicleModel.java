package com.voltix.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicle_model")
public class VehicleModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "model_id")
    private Integer modelId;

    @Column(name = "manufacturer", nullable = false, length = 100)
    private String manufacturer;

    @Column(name = "model_name", nullable = false, length = 100)
    private String modelName;

    @Column(name = "battery_capacity", nullable = false, precision = 6, scale = 2)
    private BigDecimal batteryCapacity;

    @Column(name = "max_charging_power", nullable = false, precision = 6, scale = 2)
    private BigDecimal maxChargingPower;

    public VehicleModel() {}

    public VehicleModel(String manufacturer, String modelName, BigDecimal batteryCapacity, BigDecimal maxChargingPower) {
        this.manufacturer = manufacturer;
        this.modelName = modelName;
        this.batteryCapacity = batteryCapacity;
        this.maxChargingPower = maxChargingPower;
    }

    public Integer getModelId() { return modelId; }
    public void setModelId(Integer modelId) { this.modelId = modelId; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public BigDecimal getBatteryCapacity() { return batteryCapacity; }
    public void setBatteryCapacity(BigDecimal batteryCapacity) { this.batteryCapacity = batteryCapacity; }

    public BigDecimal getMaxChargingPower() { return maxChargingPower; }
    public void setMaxChargingPower(BigDecimal maxChargingPower) { this.maxChargingPower = maxChargingPower; }
}
