package com.voltix.controller;

import com.voltix.dto.MaintenanceRecordDto;
import com.voltix.dto.MaintenanceRequestDto;
import com.voltix.dto.MaintenanceResponse;
import com.voltix.security.SecurityUtils;
import com.voltix.service.MaintenanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@Tag(name = "Maintenance", description = "Hardware ticketing, incident response, and technician work logs")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @GetMapping
    @Operation(summary = "List maintenance requests according to caller role (Operator/Technician/Admin)")
    public ResponseEntity<List<MaintenanceResponse>> getAllRequests(
            @RequestParam(required = false) String status) {
        Integer userId = SecurityUtils.getCurrentUserId();
        String role = SecurityUtils.getCurrentUserRole();
        List<MaintenanceResponse> requests = maintenanceService.getAllRequests(userId, role, status);
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Retrieve specific maintenance ticket and attached service records")
    public ResponseEntity<MaintenanceResponse> getRequestById(@PathVariable("id") Integer id) {
        MaintenanceResponse response = maintenanceService.getRequestById(id);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @Operation(summary = "Log an incident ticket on defective charger hardware")
    public ResponseEntity<MaintenanceResponse> createRequest(@Valid @RequestBody MaintenanceRequestDto dto) {
        Integer userId = SecurityUtils.getCurrentUserId();
        MaintenanceResponse response = maintenanceService.createRequest(userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update ticket progress status or assign field technician")
    public ResponseEntity<MaintenanceResponse> updateRequestStatus(
            @PathVariable("id") Integer id,
            @RequestBody Map<String, Object> body) {
        String status = (String) body.get("status");
        Integer technicianId = body.get("technicianId") != null
                ? Integer.valueOf(body.get("technicianId").toString())
                : null;
        MaintenanceResponse response = maintenanceService.updateRequestStatus(id, status, technicianId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/records")
    @Operation(summary = "Append field service work log and component repair costs")
    public ResponseEntity<MaintenanceResponse> addRecord(
            @PathVariable("id") Integer id,
            @Valid @RequestBody MaintenanceRecordDto dto) {
        Integer userId = SecurityUtils.getCurrentUserId();
        MaintenanceResponse response = maintenanceService.addRecord(id, userId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
