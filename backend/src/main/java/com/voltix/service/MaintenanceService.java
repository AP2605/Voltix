package com.voltix.service;

import com.voltix.dto.MaintenanceRecordDto;
import com.voltix.dto.MaintenanceRequestDto;
import com.voltix.dto.MaintenanceResponse;
import com.voltix.entity.Charger;
import com.voltix.entity.MaintenanceRecord;
import com.voltix.entity.MaintenanceRequest;
import com.voltix.entity.User;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ForbiddenException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.ChargerRepository;
import com.voltix.repository.MaintenanceRecordRepository;
import com.voltix.repository.MaintenanceRequestRepository;
import com.voltix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private static final Logger log = LoggerFactory.getLogger(MaintenanceService.class);

    private final MaintenanceRequestRepository maintenanceRequestRepository;
    private final MaintenanceRecordRepository maintenanceRecordRepository;
    private final ChargerRepository chargerRepository;
    private final UserRepository userRepository;

    public MaintenanceService(MaintenanceRequestRepository maintenanceRequestRepository,
                              MaintenanceRecordRepository maintenanceRecordRepository,
                              ChargerRepository chargerRepository,
                              UserRepository userRepository) {
        this.maintenanceRequestRepository = maintenanceRequestRepository;
        this.maintenanceRecordRepository = maintenanceRecordRepository;
        this.chargerRepository = chargerRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public MaintenanceResponse createRequest(Integer userId, MaintenanceRequestDto dto) {
        Charger charger = chargerRepository.findById(dto.getChargerId())
                .orElseThrow(() -> new ResourceNotFoundException("Charger", "id", dto.getChargerId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // If user is OPERATOR, verify charger belongs to one of their stations
        if ("OPERATOR".equalsIgnoreCase(user.getRole())) {
            if (!charger.getStation().getOperator().getUserId().equals(userId)) {
                throw new ForbiddenException("Operators may only report maintenance for their own stations");
            }
        }

        User technician = null;
        if (dto.getTechnicianId() != null) {
            technician = userRepository.findById(dto.getTechnicianId())
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", dto.getTechnicianId()));
            if (!"TECHNICIAN".equalsIgnoreCase(technician.getRole())) {
                throw new BadRequestException("Assigned user must have TECHNICIAN role");
            }
        }

        MaintenanceRequest request = new MaintenanceRequest(
                charger,
                technician,
                dto.getIssueType(),
                dto.getPriority(),
                "OPEN"
        );

        MaintenanceRequest saved = maintenanceRequestRepository.save(request);

        // If critical priority or requested, we can also ensure charger status is MAINTENANCE
        if ("CRITICAL".equalsIgnoreCase(dto.getPriority()) || "HIGH".equalsIgnoreCase(dto.getPriority())) {
            charger.setStatus("MAINTENANCE");
            chargerRepository.save(charger);
        }

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public MaintenanceResponse getRequestById(Integer requestId) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", requestId));
        return mapToResponse(request);
    }

    @Transactional(readOnly = true)
    public List<MaintenanceResponse> getAllRequests(Integer userId, String role, String status) {
        List<MaintenanceRequest> requests;

        if ("OPERATOR".equalsIgnoreCase(role)) {
            requests = maintenanceRequestRepository.findByCharger_Station_Operator_UserId(userId);
        } else if ("TECHNICIAN".equalsIgnoreCase(role)) {
            requests = maintenanceRequestRepository.findByTechnician_UserId(userId);
        } else {
            // ADMIN or others
            if (status != null && !status.isBlank()) {
                requests = maintenanceRequestRepository.findByStatus(status.toUpperCase());
            } else {
                requests = maintenanceRequestRepository.findAll();
            }
        }

        if (status != null && !status.isBlank()) {
            requests = requests.stream()
                    .filter(r -> r.getStatus().equalsIgnoreCase(status))
                    .collect(Collectors.toList());
        }

        return requests.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional
    public MaintenanceResponse updateRequestStatus(Integer requestId, String status, Integer technicianId) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", requestId));

        if (status != null && !status.isBlank()) {
            String normStatus = status.toUpperCase();
            if (!List.of("OPEN", "IN_PROGRESS", "RESOLVED", "CANCELLED").contains(normStatus)) {
                throw new BadRequestException("Invalid status: " + status);
            }
            request.setStatus(normStatus);

            // If resolved or cancelled, check if charger can be returned to AVAILABLE
            if ("RESOLVED".equals(normStatus) || "CANCELLED".equals(normStatus)) {
                Charger charger = request.getCharger();
                List<MaintenanceRequest> openOnCharger = maintenanceRequestRepository.findByCharger_ChargerId(charger.getChargerId())
                        .stream()
                        .filter(r -> !r.getRequestId().equals(requestId) &&
                                ("OPEN".equalsIgnoreCase(r.getStatus()) || "IN_PROGRESS".equalsIgnoreCase(r.getStatus())))
                        .toList();

                if (openOnCharger.isEmpty() && "MAINTENANCE".equalsIgnoreCase(charger.getStatus())) {
                    charger.setStatus("AVAILABLE");
                    chargerRepository.save(charger);
                }
            } else if ("IN_PROGRESS".equals(normStatus)) {
                Charger charger = request.getCharger();
                if (!"MAINTENANCE".equalsIgnoreCase(charger.getStatus())) {
                    charger.setStatus("MAINTENANCE");
                    chargerRepository.save(charger);
                }
            }
        }

        if (technicianId != null) {
            User technician = userRepository.findById(technicianId)
                    .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", technicianId));
            if (!"TECHNICIAN".equalsIgnoreCase(technician.getRole())) {
                throw new BadRequestException("Assigned user must have TECHNICIAN role");
            }
            request.setTechnician(technician);
        }

        MaintenanceRequest updated = maintenanceRequestRepository.save(request);
        return mapToResponse(updated);
    }

    @Transactional
    public MaintenanceResponse addRecord(Integer requestId, Integer technicianUserId, MaintenanceRecordDto dto) {
        MaintenanceRequest request = maintenanceRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("MaintenanceRequest", "id", requestId));

        Integer techId = dto.getTechnicianId() != null ? dto.getTechnicianId() : technicianUserId;
        User technician = userRepository.findById(techId)
                .orElseThrow(() -> new ResourceNotFoundException("Technician", "id", techId));

        LocalDateTime startTime = dto.getStartTime() != null ? dto.getStartTime() : LocalDateTime.now();
        LocalDateTime endTime = dto.getEndTime();

        MaintenanceRecord record = new MaintenanceRecord(
                request,
                technician,
                startTime,
                endTime,
                dto.getCost(),
                dto.getDescription()
        );

        maintenanceRecordRepository.save(record);

        if (endTime != null && "OPEN".equalsIgnoreCase(request.getStatus())) {
            request.setStatus("IN_PROGRESS");
            maintenanceRequestRepository.save(request);
        }

        return mapToResponse(request);
    }

    public MaintenanceResponse mapToResponse(MaintenanceRequest req) {
        MaintenanceResponse resp = new MaintenanceResponse();
        resp.setRequestId(req.getRequestId());
        resp.setChargerId(req.getCharger().getChargerId());
        resp.setChargerNumber(req.getCharger().getChargerNumber());
        resp.setStationId(req.getCharger().getStation().getStationId());
        resp.setStationName(req.getCharger().getStation().getStationName());

        if (req.getTechnician() != null) {
            resp.setTechnicianId(req.getTechnician().getUserId());
            resp.setTechnicianName(req.getTechnician().getName());
        }

        resp.setIssueType(req.getIssueType());
        resp.setPriority(req.getPriority());
        resp.setStatus(req.getStatus());
        resp.setCreatedAt(req.getCreatedAt());

        List<MaintenanceRecord> records = maintenanceRecordRepository.findByRequest_RequestId(req.getRequestId());
        List<MaintenanceRecordDto> recordDtos = records.stream().map(r -> {
            MaintenanceRecordDto d = new MaintenanceRecordDto();
            d.setTechnicianId(r.getTechnician().getUserId());
            d.setStartTime(r.getStartTime());
            d.setEndTime(r.getEndTime());
            d.setCost(r.getCost());
            d.setDescription(r.getDescription());
            return d;
        }).collect(Collectors.toList());

        resp.setRecords(recordDtos);
        return resp;
    }
}
