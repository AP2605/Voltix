package com.voltix.controller;

import com.voltix.dto.ChargerResponse;
import com.voltix.dto.StationResponse;
import com.voltix.service.ChargerService;
import com.voltix.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stations")
@Tag(name = "Stations", description = "Endpoints for discovering charging stations and retrieving real-time availability")
public class StationController {

    private final StationService stationService;
    private final ChargerService chargerService;

    public StationController(StationService stationService, ChargerService chargerService) {
        this.stationService = stationService;
        this.chargerService = chargerService;
    }

    @GetMapping
    @Operation(summary = "Search and filter charging stations across cities, connectors, and power ratings")
    public ResponseEntity<List<StationResponse>> getStations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer cityId,
            @RequestParam(required = false) String connectorType,
            @RequestParam(required = false) String speedCategory,
            @RequestParam(required = false) Boolean availableOnly) {
        List<StationResponse> stations = stationService.getStations(search, cityId, connectorType, speedCategory, availableOnly);
        return ResponseEntity.ok(stations);
    }

    @GetMapping("/nearby")
    @Operation(summary = "Find stations closest to user simulation coordinates")
    public ResponseEntity<List<StationResponse>> getNearbyStations(
            @RequestParam(defaultValue = "10") int limit) {
        List<StationResponse> nearby = stationService.getNearbyStations(limit);
        return ResponseEntity.ok(nearby);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve complete details, chargers, pricing, and reviews for a specific station")
    public ResponseEntity<StationResponse> getStationById(@PathVariable("id") Integer id) {
        StationResponse station = stationService.getStationById(id);
        return ResponseEntity.ok(station);
    }

    @GetMapping("/{id}/chargers")
    @Operation(summary = "Retrieve all chargers installed at a specific station")
    public ResponseEntity<List<ChargerResponse>> getStationChargers(@PathVariable("id") Integer id) {
        List<ChargerResponse> chargers = chargerService.getChargersByStation(id);
        return ResponseEntity.ok(chargers);
    }
}
