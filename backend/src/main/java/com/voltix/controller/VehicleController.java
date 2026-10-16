package com.voltix.controller;

import com.voltix.dto.ApiResponse;
import com.voltix.dto.VehicleRequest;
import com.voltix.dto.VehicleResponse;
import com.voltix.exception.ForbiddenException;
import com.voltix.security.SecurityUtils;
import com.voltix.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
@Tag(name = "Vehicles", description = "Endpoints for managing EV profiles, registration plates, and battery states")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    @Operation(summary = "Retrieve all EV vehicles registered by the authenticated user")
    public ResponseEntity<List<VehicleResponse>> getMyVehicles() {
        Integer userId = SecurityUtils.getCurrentUserId();
        List<VehicleResponse> vehicles = vehicleService.getUserVehicles(userId);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Retrieve all active EV vehicles registered by a specific user")
    public ResponseEntity<List<VehicleResponse>> getUserVehicles(@PathVariable("userId") Integer userId) {
        Integer currentUserId = SecurityUtils.getCurrentUserId();
        if (!currentUserId.equals(userId) && !SecurityUtils.hasRole("ADMIN") && !SecurityUtils.hasRole("OPERATOR")) {
            throw new ForbiddenException("You do not have permission to view this user's vehicles");
        }
        List<VehicleResponse> vehicles = vehicleService.getUserVehicles(userId);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve details for a specific registered vehicle")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        VehicleResponse vehicle = vehicleService.getVehicleById(userId, id);
        return ResponseEntity.ok(vehicle);
    }

    @PostMapping
    @Operation(summary = "Register a new EV vehicle under the authenticated user account")
    public ResponseEntity<VehicleResponse> addVehicle(@Valid @RequestBody VehicleRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        VehicleResponse response = vehicleService.addVehicle(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update vehicle state (e.g. current battery percentage or license plate)")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable("id") Integer id,
            @RequestBody VehicleRequest request) {
        Integer userId = SecurityUtils.getCurrentUserId();
        VehicleResponse updated = vehicleService.updateVehicle(userId, id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Remove a vehicle from the user profile")
    public ResponseEntity<ApiResponse> deleteVehicle(@PathVariable("id") Integer id) {
        Integer userId = SecurityUtils.getCurrentUserId();
        vehicleService.deleteVehicle(userId, id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully"));
    }
}
