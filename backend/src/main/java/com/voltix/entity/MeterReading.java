package com.voltix.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "meter_reading")
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "reading_id")
    private Integer readingId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChargingSession session;

    @Column(name = "reading_time", nullable = false)
    private LocalDateTime readingTime;

    @Column(name = "voltage", nullable = false, precision = 6, scale = 2)
    private BigDecimal voltage;

    @Column(name = "`current`", nullable = false, precision = 6, scale = 2)
    private BigDecimal current;

    @Column(name = "energy_kwh", nullable = false, precision = 8, scale = 2)
    private BigDecimal energyKwh;

    public MeterReading() {}

    public MeterReading(ChargingSession session, BigDecimal voltage, BigDecimal current, BigDecimal energyKwh) {
        this.session = session;
        this.voltage = voltage;
        this.current = current;
        this.energyKwh = energyKwh;
        this.readingTime = LocalDateTime.now();
    }

    @PrePersist
    public void prePersist() {
        if (this.readingTime == null) {
            this.readingTime = LocalDateTime.now();
        }
    }

    public Integer getReadingId() { return readingId; }
    public void setReadingId(Integer readingId) { this.readingId = readingId; }

    public ChargingSession getSession() { return session; }
    public void setSession(ChargingSession session) { this.session = session; }

    public LocalDateTime getReadingTime() { return readingTime; }
    public void setReadingTime(LocalDateTime readingTime) { this.readingTime = readingTime; }

    public BigDecimal getVoltage() { return voltage; }
    public void setVoltage(BigDecimal voltage) { this.voltage = voltage; }

    public BigDecimal getCurrent() { return current; }
    public void setCurrent(BigDecimal current) { this.current = current; }

    public BigDecimal getEnergyKwh() { return energyKwh; }
    public void setEnergyKwh(BigDecimal energyKwh) { this.energyKwh = energyKwh; }
}
