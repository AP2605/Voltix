package com.voltix.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "charging_session")
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "session_id")
    private Integer sessionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reservation_id", unique = true)
    private Reservation reservation;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "charger_id", nullable = false)
    private Charger charger;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "energy_consumed", nullable = false, precision = 8, scale = 2)
    private BigDecimal energyConsumed;

    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes;

    @Column(name = "final_cost", nullable = false, precision = 10, scale = 2)
    private BigDecimal finalCost;

    public ChargingSession() {}

    public ChargingSession(Reservation reservation, Charger charger, Vehicle vehicle) {
        this.reservation = reservation;
        this.charger = charger;
        this.vehicle = vehicle;
        this.startTime = LocalDateTime.now();
        this.energyConsumed = BigDecimal.ZERO;
        this.durationMinutes = 0;
        this.finalCost = BigDecimal.ZERO;
    }

    @PrePersist
    public void prePersist() {
        if (this.startTime == null) {
            this.startTime = LocalDateTime.now();
        }
        if (this.energyConsumed == null) {
            this.energyConsumed = BigDecimal.ZERO;
        }
        if (this.durationMinutes == null) {
            this.durationMinutes = 0;
        }
        if (this.finalCost == null) {
            this.finalCost = BigDecimal.ZERO;
        }
    }

    public Integer getSessionId() { return sessionId; }
    public void setSessionId(Integer sessionId) { this.sessionId = sessionId; }

    public Reservation getReservation() { return reservation; }
    public void setReservation(Reservation reservation) { this.reservation = reservation; }

    public Charger getCharger() { return charger; }
    public void setCharger(Charger charger) { this.charger = charger; }

    public Vehicle getVehicle() { return vehicle; }
    public void setVehicle(Vehicle vehicle) { this.vehicle = vehicle; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public BigDecimal getEnergyConsumed() { return energyConsumed; }
    public void setEnergyConsumed(BigDecimal energyConsumed) { this.energyConsumed = energyConsumed; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public BigDecimal getFinalCost() { return finalCost; }
    public void setFinalCost(BigDecimal finalCost) { this.finalCost = finalCost; }
}
