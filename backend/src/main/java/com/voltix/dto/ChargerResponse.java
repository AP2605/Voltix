package com.voltix.dto;

import java.math.BigDecimal;

public class ChargerResponse {

    private Integer chargerId;
    private Integer stationId;
    private String chargerNumber;
    private String connectorType;
    private BigDecimal powerKw;
    private String status;
    private BigDecimal pricePerKwh;

    public ChargerResponse() {}

    public ChargerResponse(Integer chargerId, Integer stationId, String chargerNumber, String connectorType, BigDecimal powerKw, String status, BigDecimal pricePerKwh) {
        this.chargerId = chargerId;
        this.stationId = stationId;
        this.chargerNumber = chargerNumber;
        this.connectorType = connectorType;
        this.powerKw = powerKw;
        this.status = status;
        this.pricePerKwh = pricePerKwh;
    }

    public Integer getChargerId() { return chargerId; }
    public void setChargerId(Integer chargerId) { this.chargerId = chargerId; }

    public Integer getStationId() { return stationId; }
    public void setStationId(Integer stationId) { this.stationId = stationId; }

    public String getChargerNumber() { return chargerNumber; }
    public void setChargerNumber(String chargerNumber) { this.chargerNumber = chargerNumber; }

    public String getConnectorType() { return connectorType; }
    public void setConnectorType(String connectorType) { this.connectorType = connectorType; }

    public BigDecimal getPowerKw() { return powerKw; }
    public void setPowerKw(BigDecimal powerKw) { this.powerKw = powerKw; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getPricePerKwh() { return pricePerKwh; }
    public void setPricePerKwh(BigDecimal pricePerKwh) { this.pricePerKwh = pricePerKwh; }
}
