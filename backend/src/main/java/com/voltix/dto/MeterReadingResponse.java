package com.voltix.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class MeterReadingResponse {

    private Integer readingId;
    private Integer sessionId;
    private LocalDateTime readingTime;
    private BigDecimal voltage;
    private BigDecimal current;
    private BigDecimal energyKwh;

    public MeterReadingResponse() {}

    public MeterReadingResponse(Integer readingId, Integer sessionId, LocalDateTime readingTime, BigDecimal voltage, BigDecimal current, BigDecimal energyKwh) {
        this.readingId = readingId;
        this.sessionId = sessionId;
        this.readingTime = readingTime;
        this.voltage = voltage;
        this.current = current;
        this.energyKwh = energyKwh;
    }

    public Integer getReadingId() { return readingId; }
    public void setReadingId(Integer readingId) { this.readingId = readingId; }

    public Integer getSessionId() { return sessionId; }
    public void setSessionId(Integer sessionId) { this.sessionId = sessionId; }

    public LocalDateTime getReadingTime() { return readingTime; }
    public void setReadingTime(LocalDateTime readingTime) { this.readingTime = readingTime; }

    public BigDecimal getVoltage() { return voltage; }
    public void setVoltage(BigDecimal voltage) { this.voltage = voltage; }

    public BigDecimal getCurrent() { return current; }
    public void setCurrent(BigDecimal current) { this.current = current; }

    public BigDecimal getEnergyKwh() { return energyKwh; }
    public void setEnergyKwh(BigDecimal energyKwh) { this.energyKwh = energyKwh; }
}
