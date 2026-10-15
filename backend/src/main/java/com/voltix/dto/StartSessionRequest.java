package com.voltix.dto;

public class StartSessionRequest {

    private Integer reservationId;
    private Integer vehicleId;
    private Integer chargerId;
    private Integer stationId;

    public StartSessionRequest() {}

    public StartSessionRequest(Integer reservationId, Integer vehicleId, Integer chargerId, Integer stationId) {
        this.reservationId = reservationId;
        this.vehicleId = vehicleId;
        this.chargerId = chargerId;
        this.stationId = stationId;
    }

    public Integer getReservationId() { return reservationId; }
    public void setReservationId(Integer reservationId) { this.reservationId = reservationId; }

    public Integer getVehicleId() { return vehicleId; }
    public void setVehicleId(Integer vehicleId) { this.vehicleId = vehicleId; }

    public Integer getChargerId() { return chargerId; }
    public void setChargerId(Integer chargerId) { this.chargerId = chargerId; }

    public Integer getStationId() { return stationId; }
    public void setStationId(Integer stationId) { this.stationId = stationId; }
}
