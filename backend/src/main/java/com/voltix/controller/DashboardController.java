package com.voltix.controller;

import com.voltix.dto.AdminDashboardResponse;
import com.voltix.dto.DriverDashboardResponse;
import com.voltix.dto.OperatorDashboardResponse;
import com.voltix.security.SecurityUtils;
import com.voltix.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboards", description = "Role-tailored aggregated telemetry and operational KPIs")
public class DashboardController {

    private final AnalyticsService analyticsService;

    public DashboardController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/driver")
    @Operation(summary = "Aggregated dashboard metrics for EV drivers (wallet, monthly energy, offset, active session)")
    public ResponseEntity<DriverDashboardResponse> getDriverDashboard() {
        Integer userId = SecurityUtils.getCurrentUserId();
        DriverDashboardResponse response = analyticsService.getDriverDashboard(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/operator")
    @Operation(summary = "Aggregated fleet metrics for station operators (utilization, active tickets, charger states)")
    public ResponseEntity<OperatorDashboardResponse> getOperatorDashboard() {
        Integer operatorId = SecurityUtils.getCurrentUserId();
        OperatorDashboardResponse response = analyticsService.getOperatorDashboard(operatorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin")
    @Operation(summary = "Executive high-level platform health, financial metrics, and total throughput")
    public ResponseEntity<AdminDashboardResponse> getAdminDashboard() {
        AdminDashboardResponse response = analyticsService.getAdminDashboard();
        return ResponseEntity.ok(response);
    }
}
