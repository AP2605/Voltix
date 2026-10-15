package com.voltix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class MaintenanceRequestDto {

    @NotNull(message = "Charger ID is required")
    private Integer chargerId;

    @NotBlank(message = "Issue type description is required")
    private String issueType;

    private String priority = "MEDIUM"; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
    private Integer technicianId;

    public MaintenanceRequestDto() {}

    public MaintenanceRequestDto(Integer chargerId, String issueType, String priority, Integer technicianId) {
        this.chargerId = chargerId;
        this.issueType = issueType;
        this.priority = priority != null ? priority : "MEDIUM";
        this.technicianId = technicianId;
    }

    public Integer getChargerId() { return chargerId; }
    public void setChargerId(Integer chargerId) { this.chargerId = chargerId; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Integer getTechnicianId() { return technicianId; }
    public void setTechnicianId(Integer technicianId) { this.technicianId = technicianId; }
}
