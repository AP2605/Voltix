package com.voltix.service;

import com.voltix.dto.VehicleRequest;
import com.voltix.dto.VehicleResponse;
import com.voltix.entity.User;
import com.voltix.entity.Vehicle;
import com.voltix.entity.VehicleModel;
import com.voltix.exception.BadRequestException;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ForbiddenException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.UserRepository;
import com.voltix.repository.VehicleModelRepository;
import com.voltix.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final UserRepository userRepository;

    public VehicleService(VehicleRepository vehicleRepository,
                          VehicleModelRepository vehicleModelRepository,
                          UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.vehicleModelRepository = vehicleModelRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<VehicleResponse> getUserVehicles(Integer userId) {
        return vehicleRepository.findByUser_UserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Integer userId, Integer vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        if (!vehicle.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to access this vehicle record");
        }

        return mapToDto(vehicle);
    }

    @Transactional
    public VehicleResponse addVehicle(Integer userId, VehicleRequest request) {
        String cleanReg = request.getRegistrationNumber().trim().toUpperCase();

        if (vehicleRepository.existsByRegistrationNumber(cleanReg)) {
            throw new ConflictException("A vehicle with registration plate " + cleanReg + " is already registered");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        VehicleModel model = vehicleModelRepository.findById(request.getModelId())
                .orElseThrow(() -> new ResourceNotFoundException("VehicleModel", "id", request.getModelId()));

        BigDecimal soc = request.getBatteryPercentage() != null
                ? request.getBatteryPercentage()
                : new BigDecimal("80.00");

        Vehicle vehicle = new Vehicle(user, model, cleanReg, soc);
        vehicle = vehicleRepository.save(vehicle);

        return mapToDto(vehicle);
    }

    @Transactional
    public VehicleResponse updateVehicle(Integer userId, Integer vehicleId, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        if (!vehicle.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to modify this vehicle");
        }

        if (request.getModelId() != null && !request.getModelId().equals(vehicle.getModel().getModelId())) {
            VehicleModel model = vehicleModelRepository.findById(request.getModelId())
                    .orElseThrow(() -> new ResourceNotFoundException("VehicleModel", "id", request.getModelId()));
            vehicle.setModel(model);
        }

        if (request.getRegistrationNumber() != null && !request.getRegistrationNumber().isBlank()) {
            String cleanReg = request.getRegistrationNumber().trim().toUpperCase();
            if (!cleanReg.equals(vehicle.getRegistrationNumber()) && vehicleRepository.existsByRegistrationNumber(cleanReg)) {
                throw new ConflictException("Registration number already registered to another vehicle");
            }
            vehicle.setRegistrationNumber(cleanReg);
        }

        if (request.getBatteryPercentage() != null) {
            vehicle.setBatteryPercentage(request.getBatteryPercentage());
        }

        vehicle = vehicleRepository.save(vehicle);
        return mapToDto(vehicle);
    }

    @Transactional
    public void deleteVehicle(Integer userId, Integer vehicleId) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", "id", vehicleId));

        if (!vehicle.getUser().getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to delete this vehicle");
        }

        try {
            vehicleRepository.delete(vehicle);
        } catch (Exception ex) {
            throw new BadRequestException("Cannot delete vehicle because historical charging or reservation records reference it");
        }
    }

    public VehicleResponse mapToDto(Vehicle v) {
        VehicleModel m = v.getModel();
        double batteryCap = m.getBatteryCapacity().doubleValue();
        double soc = v.getBatteryPercentage().doubleValue();
        int estimatedRange = (int) Math.round((soc / 100.0) * (batteryCap * 7.5));

        return new VehicleResponse(
                v.getVehicleId(),
                v.getUser().getUserId(),
                m.getModelId(),
                m.getManufacturer(),
                m.getModelName(),
                v.getRegistrationNumber(),
                v.getBatteryPercentage(),
                m.getBatteryCapacity(),
                m.getMaxChargingPower(),
                estimatedRange
        );
    }
}
