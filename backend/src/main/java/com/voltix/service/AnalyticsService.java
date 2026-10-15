package com.voltix.service;

import com.voltix.dto.*;
import com.voltix.entity.*;
import com.voltix.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final ChargingStationRepository stationRepository;
    private final ChargerRepository chargerRepository;
    private final ChargingSessionRepository sessionRepository;
    private final PaymentRepository paymentRepository;
    private final WalletRepository walletRepository;
    private final VehicleRepository vehicleRepository;
    private final ReservationRepository reservationRepository;
    private final StationRevenueViewRepository stationRevenueViewRepository;
    private final ChargerHealthViewRepository chargerHealthViewRepository;
    private final UserChargingHistoryViewRepository userChargingHistoryViewRepository;
    private final StoredProcedureRepository storedProcedureRepository;

    private final StationService stationService;
    private final ChargingSessionService chargingSessionService;
    private final ReservationService reservationService;
    private final VehicleService vehicleService;
    private final MaintenanceService maintenanceService;

    public AnalyticsService(UserRepository userRepository,
                            ChargingStationRepository stationRepository,
                            ChargerRepository chargerRepository,
                            ChargingSessionRepository sessionRepository,
                            PaymentRepository paymentRepository,
                            WalletRepository walletRepository,
                            VehicleRepository vehicleRepository,
                            ReservationRepository reservationRepository,
                            StationRevenueViewRepository stationRevenueViewRepository,
                            ChargerHealthViewRepository chargerHealthViewRepository,
                            UserChargingHistoryViewRepository userChargingHistoryViewRepository,
                            StoredProcedureRepository storedProcedureRepository,
                            StationService stationService,
                            ChargingSessionService chargingSessionService,
                            ReservationService reservationService,
                            VehicleService vehicleService,
                            MaintenanceService maintenanceService) {
        this.userRepository = userRepository;
        this.stationRepository = stationRepository;
        this.chargerRepository = chargerRepository;
        this.sessionRepository = sessionRepository;
        this.paymentRepository = paymentRepository;
        this.walletRepository = walletRepository;
        this.vehicleRepository = vehicleRepository;
        this.reservationRepository = reservationRepository;
        this.stationRevenueViewRepository = stationRevenueViewRepository;
        this.chargerHealthViewRepository = chargerHealthViewRepository;
        this.userChargingHistoryViewRepository = userChargingHistoryViewRepository;
        this.storedProcedureRepository = storedProcedureRepository;
        this.stationService = stationService;
        this.chargingSessionService = chargingSessionService;
        this.reservationService = reservationService;
        this.vehicleService = vehicleService;
        this.maintenanceService = maintenanceService;
    }

    @Transactional(readOnly = true)
    public DriverDashboardResponse getDriverDashboard(Integer userId) {
        DriverDashboardResponse resp = new DriverDashboardResponse();

        // 1. Wallet balance
        Optional<Wallet> wallet = walletRepository.findByUser_UserId(userId);
        resp.setWalletBalance(wallet.map(Wallet::getBalance).orElse(BigDecimal.ZERO));

        // 2. User sessions
        List<ChargingSession> userSessions = sessionRepository.findByVehicle_User_UserIdOrderByStartTimeDesc(userId);
        List<ChargingSession> completed = userSessions.stream()
                .filter(s -> s.getEndTime() != null)
                .toList();

        resp.setCompletedChargesCount(completed.size());

        // 3. Monthly energy consumption (past 30 days or current month)
        LocalDateTime monthThreshold = LocalDateTime.now().minusDays(30);
        double monthlyEnergy = completed.stream()
                .filter(s -> s.getStartTime().isAfter(monthThreshold))
                .mapToDouble(s -> s.getEnergyConsumed().doubleValue())
                .sum();

        if (monthlyEnergy == 0.0 && !completed.isEmpty()) {
            monthlyEnergy = completed.stream()
                    .mapToDouble(s -> s.getEnergyConsumed().doubleValue())
                    .sum();
        }

        resp.setMonthlyEnergyKwh(Math.round(monthlyEnergy * 100.0) / 100.0);
        resp.setCo2OffsetKg((int) Math.round(monthlyEnergy * 0.82));

        // 4. Active session if any
        Optional<ChargingSession> active = sessionRepository.findTopByVehicle_User_UserIdAndEndTimeIsNullOrderByStartTimeDesc(userId);
        resp.setActiveSession(active.map(chargingSessionService::mapToResponse).orElse(null));

        // 5. Vehicles
        resp.setVehicles(vehicleRepository.findByUser_UserId(userId).stream()
                .map(vehicleService::mapToDto)
                .collect(Collectors.toList()));

        // 6. Recent reservations
        resp.setRecentReservations(reservationRepository.findByUser_UserIdOrderByStartTimeDesc(userId).stream()
                .limit(5)
                .map(reservationService::mapToDto)
                .collect(Collectors.toList()));

        // 7. Recent sessions
        resp.setRecentSessions(userSessions.stream()
                .limit(5)
                .map(chargingSessionService::mapToResponse)
                .collect(Collectors.toList()));

        // 8. Nearby stations
        resp.setNearbyStations(stationRepository.findAll().stream()
                .limit(6)
                .map(stationService::mapToStationResponse)
                .collect(Collectors.toList()));

        return resp;
    }

    @Transactional(readOnly = true)
    public OperatorDashboardResponse getOperatorDashboard(Integer operatorId) {
        OperatorDashboardResponse resp = new OperatorDashboardResponse();

        List<ChargingStation> stations = stationRepository.findByOperator_UserId(operatorId);
        resp.setTotalStations(stations.size());

        List<Charger> chargers = chargerRepository.findByStation_Operator_UserId(operatorId);
        resp.setTotalChargers(chargers.size());

        int occupied = (int) chargers.stream()
                .filter(c -> "IN_USE".equalsIgnoreCase(c.getStatus()) || "RESERVED".equalsIgnoreCase(c.getStatus()))
                .count();
        int available = (int) chargers.stream()
                .filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus()))
                .count();
        int maintenance = (int) chargers.stream()
                .filter(c -> "MAINTENANCE".equalsIgnoreCase(c.getStatus()))
                .count();

        resp.setOccupiedChargers(occupied);
        resp.setAvailableChargers(available);
        resp.setMaintenanceChargers(maintenance);

        BigDecimal util = chargers.isEmpty() ? BigDecimal.ZERO :
                BigDecimal.valueOf((double) occupied / chargers.size() * 100.0).setScale(1, RoundingMode.HALF_UP);
        resp.setUtilizationPercentage(util);

        List<MaintenanceResponse> tickets = maintenanceService.getAllRequests(operatorId, "OPERATOR", null);
        int activeTickets = (int) tickets.stream()
                .filter(t -> "OPEN".equalsIgnoreCase(t.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(t.getStatus()))
                .count();
        resp.setActiveTickets(activeTickets);
        resp.setMaintenanceRequests(tickets);

        resp.setStations(stations.stream()
                .map(stationService::mapToStationResponse)
                .collect(Collectors.toList()));

        return resp;
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getAdminDashboard() {
        AdminDashboardResponse resp = new AdminDashboardResponse();

        resp.setTotalUsers(userRepository.count());
        resp.setTotalStations(stationRepository.count());

        List<Charger> allChargers = chargerRepository.findAll();
        resp.setTotalChargers((long) allChargers.size());

        long activeChargers = allChargers.stream()
                .filter(c -> "AVAILABLE".equalsIgnoreCase(c.getStatus()) || "IN_USE".equalsIgnoreCase(c.getStatus()))
                .count();
        resp.setActiveChargers(activeChargers);

        List<ChargingSession> allSessions = sessionRepository.findAll();
        long activeSessions = allSessions.stream().filter(s -> s.getEndTime() == null).count();
        List<ChargingSession> completedSessions = allSessions.stream().filter(s -> s.getEndTime() != null).toList();

        resp.setActiveSessionsCount(activeSessions);
        resp.setCompletedSessionsCount((long) completedSessions.size());

        BigDecimal totalEnergy = completedSessions.stream()
                .map(ChargingSession::getEnergyConsumed)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setTotalEnergyDeliveredKwh(totalEnergy.setScale(2, RoundingMode.HALF_UP));

        BigDecimal totalRevenue = paymentRepository.findByPaymentStatus("SUCCESS").stream()
                .map(Payment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resp.setTotalRevenueInr(totalRevenue.setScale(2, RoundingMode.HALF_UP));

        double co2AvoidedTons = Math.round(totalEnergy.doubleValue() * 0.00082 * 100.0) / 100.0;
        resp.setCo2AvoidedTons(co2AvoidedTons);

        resp.setStationRevenues(stationRevenueViewRepository.findAll());
        resp.setChargerHealths(chargerHealthViewRepository.findAll());

        resp.setRecentSessions(allSessions.stream()
                .sorted((a, b) -> b.getStartTime().compareTo(a.getStartTime()))
                .limit(10)
                .map(chargingSessionService::mapToResponse)
                .collect(Collectors.toList()));

        return resp;
    }

    public Map<String, Object> getStationReport(Integer stationId, LocalDate startDate, LocalDate endDate) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().minusDays(30);
        LocalDate end = endDate != null ? endDate : LocalDate.now();
        return storedProcedureRepository.getStationReport(stationId, start, end);
    }

    public List<StationRevenueView> getStationRevenueView() {
        return stationRevenueViewRepository.findAll();
    }

    public List<ChargerHealthView> getChargerHealthView() {
        return chargerHealthViewRepository.findAll();
    }

    public List<UserChargingHistoryView> getUserChargingHistory(Integer userId) {
        return userChargingHistoryViewRepository.findByUserIdOrderBySessionStartDesc(userId);
    }
}
