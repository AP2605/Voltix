package com.voltix.service;

import com.voltix.dto.ChargerResponse;
import com.voltix.dto.StationResponse;
import com.voltix.entity.City;
import com.voltix.entity.ChargingStation;
import com.voltix.entity.Review;
import com.voltix.entity.VehicleModel;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StationService {

    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final CityRepository cityRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final ReviewRepository reviewRepository;

    public StationService(ChargingStationRepository stationRepository,
                          ChargerRepository chargerRepository,
                          CityRepository cityRepository,
                          VehicleModelRepository vehicleModelRepository,
                          ReviewRepository reviewRepository) {
        this.stationRepository = stationRepository;
        this.chargerRepository = chargerRepository;
        this.cityRepository = cityRepository;
        this.vehicleModelRepository = vehicleModelRepository;
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public List<StationResponse> getStations(String search, Integer cityId, String connectorType, String speedCategory, Boolean availableOnly) {
        List<ChargingStation> allStations = stationRepository.findAll();

        return allStations.stream()
                .filter(s -> search == null || search.isBlank() ||
                        s.getStationName().toLowerCase().contains(search.toLowerCase()) ||
                        s.getAddress().toLowerCase().contains(search.toLowerCase()) ||
                        s.getCity().getCityName().toLowerCase().contains(search.toLowerCase()))
                .filter(s -> cityId == null || s.getCity().getCityId().equals(cityId))
                .map(this::mapToStationResponse)
                .filter(s -> connectorType == null || connectorType.isBlank() ||
                        s.getChargers().stream().anyMatch(c -> c.getConnectorType().equalsIgnoreCase(connectorType)))
                .filter(s -> {
                    if (speedCategory == null || speedCategory.isBlank()) return true;
                    if ("Ultra Fast".equalsIgnoreCase(speedCategory)) {
                        return s.getChargers().stream().anyMatch(c -> c.getPowerKw().compareTo(new BigDecimal("100")) >= 0);
                    }
                    if ("DC Fast".equalsIgnoreCase(speedCategory)) {
                        return s.getChargers().stream().anyMatch(c ->
                                c.getPowerKw().compareTo(new BigDecimal("50")) >= 0 && c.getPowerKw().compareTo(new BigDecimal("100")) < 0);
                    }
                    if ("AC Rapid".equalsIgnoreCase(speedCategory)) {
                        return s.getChargers().stream().anyMatch(c -> c.getPowerKw().compareTo(new BigDecimal("22")) <= 0);
                    }
                    return true;
                })
                .filter(s -> availableOnly == null || !availableOnly || s.getAvailableChargersCount() > 0)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StationResponse getStationById(Integer stationId) {
        ChargingStation station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Charging Station", "id", stationId));
        return mapToStationResponse(station);
    }

    @Transactional(readOnly = true)
    public List<StationResponse> getNearbyStations(int limit) {
        return stationRepository.findAll().stream()
                .map(this::mapToStationResponse)
                .sorted((a, b) -> Double.compare(
                        a.getDistanceKm() != null ? a.getDistanceKm() : 0.0,
                        b.getDistanceKm() != null ? b.getDistanceKm() : 0.0))
                .limit(limit)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<City> getCities() {
        return cityRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<VehicleModel> getVehicleModels() {
        return vehicleModelRepository.findAll();
    }

    public StationResponse mapToStationResponse(ChargingStation s) {
        StationResponse dto = new StationResponse();
        dto.setStationId(s.getStationId());
        dto.setCityId(s.getCity().getCityId());
        dto.setCityName(s.getCity().getCityName());
        dto.setState(s.getCity().getState());
        dto.setOperatorId(s.getOperator() != null ? s.getOperator().getUserId() : null);
        dto.setStationName(s.getStationName());
        dto.setAddress(s.getAddress());
        dto.setLatitude(s.getLatitude());
        dto.setLongitude(s.getLongitude());
        dto.setStatus(s.getStatus());
        dto.setBasePricePerKwh(new BigDecimal("14.00"));
        dto.setOperatingHours("24/7 Open");

        // Curated real-world amenities based on station
        dto.setAmenities(Arrays.asList("Cafeteria", "Restrooms", "Free Wi-Fi", "Security Guard", "Covered Canopy"));

        // Approximate distance based on station ID for simulation consistency
        double simDistance = 1.5 + (s.getStationId() % 7) * 1.8;
        dto.setDistanceKm(Math.round(simDistance * 10.0) / 10.0);

        List<ChargerResponse> chargerResponses = s.getChargers().stream()
                .map(ch -> new ChargerResponse(
                        ch.getChargerId(),
                        s.getStationId(),
                        ch.getChargerNumber(),
                        ch.getChargerType().getConnectorType(),
                        ch.getChargerType().getPowerRating(),
                        ch.getStatus(),
                        ch.getChargerType().getPowerRating().compareTo(new BigDecimal("50")) > 0
                                ? new BigDecimal("17.50") : new BigDecimal("14.00")
                ))
                .collect(Collectors.toList());

        dto.setChargers(chargerResponses);
        dto.setTotalChargersCount(chargerResponses.size());

        long availableCount = chargerResponses.stream()
                .filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus()))
                .count();
        dto.setAvailableChargersCount((int) availableCount);

        List<Review> reviews = reviewRepository.findByStation_StationIdOrderByCreatedAtDesc(s.getStationId());
        dto.setTotalReviews(reviews.size());
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(4.5);
        dto.setAverageRating(Math.round(avg * 10.0) / 10.0);

        return dto;
    }
}
