package com.voltix.controller;

import com.voltix.entity.City;
import com.voltix.entity.VehicleModel;
import com.voltix.service.StationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@Tag(name = "Lookup Data", description = "Endpoints for retrieving static lookup tables (Cities, EV Models)")
public class LookupController {

    private final StationService stationService;

    public LookupController(StationService stationService) {
        this.stationService = stationService;
    }

    @GetMapping("/cities")
    @Operation(summary = "Retrieve all covered metropolitan cities and coordinates")
    public ResponseEntity<List<City>> getCities() {
        return ResponseEntity.ok(stationService.getCities());
    }

    @GetMapping("/vehicle-models")
    @Operation(summary = "Retrieve registered EV vehicle models and battery specifications")
    public ResponseEntity<List<VehicleModel>> getVehicleModels() {
        return ResponseEntity.ok(stationService.getVehicleModels());
    }
}
