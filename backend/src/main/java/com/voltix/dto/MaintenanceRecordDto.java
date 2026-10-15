package com.voltix.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MaintenanceRecordDto {

    private Integer technicianId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;

    @DecimalMin(value = "0.00", message = "Maintenance cost cannot be negative")
    private BigDecimal cost;

    @NotBlank(message = "Work description is required")
    private String description;

    public MaintenanceRecordDto() {}

    public MaintenanceRecordDto(Integer technicianId, LocalDateTime startTime, LocalDateTime endTime, BigDecimal cost, String description) {
        this.technicianId = technicianId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.cost = cost != null ? cost : BigDecimal.ZERO;
        this.description = description;
    }

    public Integer getTechnicianId() { return technicianId; }
    public void setTechnicianId(Integer technicianId) { this.technicianId = technicianId; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getCost() { return cost; }
    public void setCost(BigDecimal cost) { this.cost = cost; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
