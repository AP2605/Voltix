package com.voltix.controller;

import com.voltix.dto.ChargerResponse;
import com.voltix.entity.AvailableChargerView;
import com.voltix.service.ChargerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chargers")
@Tag(name = "Chargers", description = "Endpoints for charger hardware status and real-time availability")
public class ChargerController {

    private final ChargerService chargerService;

    public ChargerController(ChargerService chargerService) {
        this.chargerService = chargerService;
    }

    @GetMapping("/available")
    @Operation(summary = "Retrieve currently available chargers across the network via database view")
    public ResponseEntity<List<AvailableChargerView>> getAvailableChargers() {
        List<AvailableChargerView> chargers = chargerService.getAvailableChargers();
        return ResponseEntity.ok(chargers);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve detailed hardware specifications and status of a single charger")
    public ResponseEntity<ChargerResponse> getChargerById(@PathVariable("id") Integer id) {
        ChargerResponse charger = chargerService.getChargerById(id);
        return ResponseEntity.ok(charger);
    }
}
