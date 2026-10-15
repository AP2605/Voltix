package com.voltix.dto;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class MaintenanceResponse {

    private Integer requestId;
    private Integer chargerId;
    private String chargerNumber;
    private Integer stationId;
    private String stationName;
    private Integer technicianId;
    private String technicianName;
    private String issueType;
    private String priority;
    private String status;
    private LocalDateTime createdAt;
    private List<MaintenanceRecordDto> records = new ArrayList<>();

    public MaintenanceResponse() {}

    public Integer getRequestId() { return requestId; }
    public void setRequestId(Integer requestId) { this.requestId = requestId; }

    public Integer getChargerId() { return chargerId; }
    public void setChargerId(Integer chargerId) { this.chargerId = chargerId; }

    public String getChargerNumber() { return chargerNumber; }
    public void setChargerNumber(String chargerNumber) { this.chargerNumber = chargerNumber; }

    public Integer getStationId() { return stationId; }
    public void setStationId(Integer stationId) { this.stationId = stationId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public Integer getTechnicianId() { return technicianId; }
    public void setTechnicianId(Integer technicianId) { this.technicianId = technicianId; }

    public String getTechnicianName() { return technicianName; }
    public void setTechnicianName(String technicianName) { this.technicianName = technicianName; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<MaintenanceRecordDto> getRecords() { return records; }
    public void setRecords(List<MaintenanceRecordDto> records) { this.records = records; }
}
