package com.voltix.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_request")
public class MaintenanceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Integer requestId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "charger_id", nullable = false)
    private Charger charger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "technician_id")
    private User technician;

    @Column(name = "issue_type", nullable = false, length = 100)
    private String issueType;

    @Column(name = "priority", nullable = false, length = 20)
    private String priority; // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'

    @Column(name = "status", nullable = false, length = 20)
    private String status; // 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public MaintenanceRequest() {}

    public MaintenanceRequest(Charger charger, User technician, String issueType, String priority, String status) {
        this.charger = charger;
        this.technician = technician;
        this.issueType = issueType;
        this.priority = priority != null ? priority : "MEDIUM";
        this.status = status != null ? status : "OPEN";
        this.createdAt = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.priority == null) {
            this.priority = "MEDIUM";
        }
        if (this.status == null) {
            this.status = "OPEN";
        }
    }

    public Integer getRequestId() { return requestId; }
    public void setRequestId(Integer requestId) { this.requestId = requestId; }

    public Charger getCharger() { return charger; }
    public void setCharger(Charger charger) { this.charger = charger; }

    public User getTechnician() { return technician; }
    public void setTechnician(User technician) { this.technician = technician; }

    public String getIssueType() { return issueType; }
    public void setIssueType(String issueType) { this.issueType = issueType; }

    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
