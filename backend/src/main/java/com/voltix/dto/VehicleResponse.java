package com.voltix.dto;

import java.math.BigDecimal;

public class VehicleResponse {

    private Integer vehicleId;
    private Integer userId;
    private Integer modelId;
    private String manufacturer;
    private String modelName;
    private String registrationNumber;
    private BigDecimal batteryPercentage;
    private BigDecimal batteryCapacity;
    private BigDecimal maxPower;
    private Integer estimatedRangeKm;

    public VehicleResponse() {}

    public VehicleResponse(Integer vehicleId, Integer userId, Integer modelId, String manufacturer, String modelName,
                           String registrationNumber, BigDecimal batteryPercentage, BigDecimal batteryCapacity,
                           BigDecimal maxPower, Integer estimatedRangeKm) {
        this.vehicleId = vehicleId;
        this.userId = userId;
        this.modelId = modelId;
        this.manufacturer = manufacturer;
        this.modelName = modelName;
        this.registrationNumber = registrationNumber;
        this.batteryPercentage = batteryPercentage;
        this.batteryCapacity = batteryCapacity;
        this.maxPower = maxPower;
        this.estimatedRangeKm = estimatedRangeKm;
    }

    public Integer getVehicleId() { return vehicleId; }
    public void setVehicleId(Integer vehicleId) { this.vehicleId = vehicleId; }

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

    public Integer getModelId() { return modelId; }
    public void setModelId(Integer modelId) { this.modelId = modelId; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getModelName() { return modelName; }
    public void setModelName(String modelName) { this.modelName = modelName; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public BigDecimal getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(BigDecimal batteryPercentage) { this.batteryPercentage = batteryPercentage; }

    public BigDecimal getBatteryCapacity() { return batteryCapacity; }
    public void setBatteryCapacity(BigDecimal batteryCapacity) { this.batteryCapacity = batteryCapacity; }

    public BigDecimal getMaxPower() { return maxPower; }
    public void setMaxPower(BigDecimal maxPower) { this.maxPower = maxPower; }

    public Integer getEstimatedRangeKm() { return estimatedRangeKm; }
    public void setEstimatedRangeKm(Integer estimatedRangeKm) { this.estimatedRangeKm = estimatedRangeKm; }
}
