package com.voltix.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class VehicleRequest {

    @NotNull(message = "Vehicle model ID is required")
    private Integer modelId;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @DecimalMin(value = "0.0", message = "Battery percentage cannot be negative")
    @DecimalMax(value = "100.0", message = "Battery percentage cannot exceed 100%")
    private BigDecimal batteryPercentage;

    public VehicleRequest() {}

    public VehicleRequest(Integer modelId, String registrationNumber, BigDecimal batteryPercentage) {
        this.modelId = modelId;
        this.registrationNumber = registrationNumber;
        this.batteryPercentage = batteryPercentage;
    }

    public Integer getModelId() { return modelId; }
    public void setModelId(Integer modelId) { this.modelId = modelId; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public BigDecimal getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(BigDecimal batteryPercentage) { this.batteryPercentage = batteryPercentage; }
}
