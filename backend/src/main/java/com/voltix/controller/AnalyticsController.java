package com.voltix.controller;

import com.voltix.entity.ChargerHealthView;
import com.voltix.entity.StationRevenueView;
import com.voltix.entity.UserChargingHistoryView;
import com.voltix.security.SecurityUtils;
import com.voltix.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@Tag(name = "Analytics & Reports", description = "Network database views and complex multi-result stored procedure reports")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/station-revenue")
    @Operation(summary = "Query station_revenue analytical view for revenue breakdown")
    public ResponseEntity<List<StationRevenueView>> getStationRevenue() {
        return ResponseEntity.ok(analyticsService.getStationRevenueView());
    }

    @GetMapping("/charger-health")
    @Operation(summary = "Query charger_health view for uptime, fault rates, and MTBF diagnostics")
    public ResponseEntity<List<ChargerHealthView>> getChargerHealth() {
        return ResponseEntity.ok(analyticsService.getChargerHealthView());
    }

    @GetMapping("/user-history")
    @Operation(summary = "Query user_charging_history view for authenticated driver's historical usage")
    public ResponseEntity<List<UserChargingHistoryView>> getUserChargingHistory() {
        Integer userId = SecurityUtils.getCurrentUserId();
        return ResponseEntity.ok(analyticsService.getUserChargingHistory(userId));
    }

    @GetMapping("/station-report/{stationId}")
    @Operation(summary = "Invoke station_report stored procedure returning financial, energy and feedback metrics")
    public ResponseEntity<Map<String, Object>> getStationReport(
            @PathVariable("stationId") Integer stationId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        Map<String, Object> report = analyticsService.getStationReport(stationId, startDate, endDate);
        return ResponseEntity.ok(report);
    }
}
