package com.voltix.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vehicle")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "vehicle_id")
    private Integer vehicleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "model_id", nullable = false)
    private VehicleModel model;

    @Column(name = "registration_number", nullable = false, unique = true, length = 30)
    private String registrationNumber;

    @Column(name = "battery_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal batteryPercentage;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    public Vehicle() {}

    public Vehicle(User user, VehicleModel model, String registrationNumber, BigDecimal batteryPercentage) {
        this.user = user;
        this.model = model;
        this.registrationNumber = registrationNumber;
        this.batteryPercentage = batteryPercentage != null ? batteryPercentage : new BigDecimal("100.00");
        this.status = "ACTIVE";
    }

    public Integer getVehicleId() { return vehicleId; }
    public void setVehicleId(Integer vehicleId) { this.vehicleId = vehicleId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public VehicleModel getModel() { return model; }
    public void setModel(VehicleModel model) { this.model = model; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public BigDecimal getBatteryPercentage() { return batteryPercentage; }
    public void setBatteryPercentage(BigDecimal batteryPercentage) { this.batteryPercentage = batteryPercentage; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
