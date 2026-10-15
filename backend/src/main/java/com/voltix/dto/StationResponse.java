package com.voltix.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class StationResponse {

    private Integer stationId;
    private Integer cityId;
    private String cityName;
    private String state;
    private Integer operatorId;
    private String stationName;
    private String address;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double distanceKm;
    private String status;
    private BigDecimal basePricePerKwh;
    private String operatingHours;
    private List<String> amenities = new ArrayList<>();
    private List<ChargerResponse> chargers = new ArrayList<>();
    private Integer availableChargersCount;
    private Integer totalChargersCount;
    private Double averageRating;
    private Integer totalReviews;

    public StationResponse() {}

    public Integer getStationId() { return stationId; }
    public void setStationId(Integer stationId) { this.stationId = stationId; }

    public Integer getCityId() { return cityId; }
    public void setCityId(Integer cityId) { this.cityId = cityId; }

    public String getCityName() { return cityName; }
    public void setCityName(String cityName) { this.cityName = cityName; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public Integer getOperatorId() { return operatorId; }
    public void setOperatorId(Integer operatorId) { this.operatorId = operatorId; }

    public String getStationName() { return stationName; }
    public void setStationName(String stationName) { this.stationName = stationName; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }

    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }

    public Double getDistanceKm() { return distanceKm; }
    public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public BigDecimal getBasePricePerKwh() { return basePricePerKwh; }
    public void setBasePricePerKwh(BigDecimal basePricePerKwh) { this.basePricePerKwh = basePricePerKwh; }

    public String getOperatingHours() { return operatingHours; }
    public void setOperatingHours(String operatingHours) { this.operatingHours = operatingHours; }

    public List<String> getAmenities() { return amenities; }
    public void setAmenities(List<String> amenities) { this.amenities = amenities; }

    public List<ChargerResponse> getChargers() { return chargers; }
    public void setChargers(List<ChargerResponse> chargers) { this.chargers = chargers; }

    public Integer getAvailableChargersCount() { return availableChargersCount; }
    public void setAvailableChargersCount(Integer availableChargersCount) { this.availableChargersCount = availableChargersCount; }

    public Integer getTotalChargersCount() { return totalChargersCount; }
    public void setTotalChargersCount(Integer totalChargersCount) { this.totalChargersCount = totalChargersCount; }

    public Double getAverageRating() { return averageRating; }
    public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }

    public Integer getTotalReviews() { return totalReviews; }
    public void setTotalReviews(Integer totalReviews) { this.totalReviews = totalReviews; }
}
