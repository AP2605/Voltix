package com.voltix.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "pricing_rule")
public class PricingRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "rule_id")
    private Integer ruleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private PricingPlan plan;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "day_type", nullable = false, length = 20)
    private String dayType; // 'WEEKDAY', 'WEEKEND', 'ALL'

    @Column(name = "price_per_kwh", nullable = false, precision = 8, scale = 2)
    private BigDecimal pricePerKwh;

    @Column(name = "idle_fee", nullable = false, precision = 8, scale = 2)
    private BigDecimal idleFee;

    public PricingRule() {}

    public PricingRule(PricingPlan plan, LocalTime startTime, LocalTime endTime, String dayType, BigDecimal pricePerKwh, BigDecimal idleFee) {
        this.plan = plan;
        this.startTime = startTime;
        this.endTime = endTime;
        this.dayType = dayType != null ? dayType : "ALL";
        this.pricePerKwh = pricePerKwh;
        this.idleFee = idleFee != null ? idleFee : BigDecimal.ZERO;
    }

    public Integer getRuleId() { return ruleId; }
    public void setRuleId(Integer ruleId) { this.ruleId = ruleId; }

    public PricingPlan getPlan() { return plan; }
    public void setPlan(PricingPlan plan) { this.plan = plan; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public String getDayType() { return dayType; }
    public void setDayType(String dayType) { this.dayType = dayType; }

    public BigDecimal getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(BigDecimal pricePerKwh) { this.pricePerKwh = pricePerKwh; }

    public BigDecimal getIdleFee() { return idleFee; }
    public void setIdleFee(BigDecimal idleFee) { this.idleFee = idleFee; }
}
