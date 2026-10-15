package com.voltix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.Immutable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Immutable
@Table(name = "user_charging_history")
public class UserChargingHistoryView {

    @Id
    @Column(name = "session_id")
    private Integer sessionId;

    @Column(name = "user_id")
    private Integer userId;

    @Column(name = "user_name")
    private String userName;

    @Column(name = "user_email")
    private String userEmail;

    @Column(name = "user_phone")
    private String userPhone;

    @Column(name = "vehicle_id")
    private Integer vehicleId;

    @Column(name = "registration_number")
    private String registrationNumber;

    @Column(name = "manufacturer")
    private String manufacturer;

    @Column(name = "model_name")
    private String modelName;

    @Column(name = "station_id")
    private Integer stationId;

    @Column(name = "station_name")
    private String stationName;

    @Column(name = "city_name")
    private String cityName;

    @Column(name = "charger_id")
    private Integer chargerId;

    @Column(name = "charger_number")
    private String chargerNumber;

    @Column(name = "connector_type")
    private String connectorType;

    @Column(name = "session_start")
    private LocalDateTime sessionStart;

    @Column(name = "session_end")
    private LocalDateTime sessionEnd;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "energy_kwh")
    private BigDecimal energyKwh;

    @Column(name = "cost_inr")
    private BigDecimal costInr;

    @Column(name = "payment_id")
    private Integer paymentId;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_status")
    private String paymentStatus;

    @Column(name = "payment_time")
    private LocalDateTime paymentTime;

    public UserChargingHistoryView() {}

    public Integer getSessionId() { return sessionId; }
    public Integer getUserId() { return userId; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public String getUserPhone() { return userPhone; }
    public Integer getVehicleId() { return vehicleId; }
    public String getRegistrationNumber() { return registrationNumber; }
    public String getManufacturer() { return manufacturer; }
    public String getModelName() { return modelName; }
    public Integer getStationId() { return stationId; }
    public String getStationName() { return stationName; }
    public String getCityName() { return cityName; }
    public Integer getChargerId() { return chargerId; }
    public String getChargerNumber() { return chargerNumber; }
    public String getConnectorType() { return connectorType; }
    public LocalDateTime getSessionStart() { return sessionStart; }
    public LocalDateTime getSessionEnd() { return sessionEnd; }
    public Integer getDurationMinutes() { return durationMinutes; }
    public BigDecimal getEnergyKwh() { return energyKwh; }
    public BigDecimal getCostInr() { return costInr; }
    public Integer getPaymentId() { return paymentId; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentStatus() { return paymentStatus; }
    public LocalDateTime getPaymentTime() { return paymentTime; }
}
