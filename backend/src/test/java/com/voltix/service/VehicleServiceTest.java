package com.voltix.service;

import com.voltix.dto.VehicleRequest;
import com.voltix.dto.VehicleResponse;
import com.voltix.entity.User;
import com.voltix.entity.Vehicle;
import com.voltix.entity.VehicleModel;
import com.voltix.exception.ConflictException;
import com.voltix.exception.ForbiddenException;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.UserRepository;
import com.voltix.repository.VehicleModelRepository;
import com.voltix.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VehicleServiceTest {

    @Mock
    private VehicleRepository vehicleRepository;

    @Mock
    private VehicleModelRepository vehicleModelRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VehicleService vehicleService;

    private User user;
    private User otherUser;
    private VehicleModel model;
    private Vehicle vehicle;

    @BeforeEach
    void setUp() {
        user = new User("Rahul Verma", "rahul@example.com", "+919876543210", "hash", "USER", "ACTIVE");
        user.setUserId(10);

        otherUser = new User("Other User", "other@example.com", "+919876543299", "hash", "USER", "ACTIVE");
        otherUser.setUserId(20);

        model = new VehicleModel("Tata Motors", "Nexon EV Max", new BigDecimal("40.50"), new BigDecimal("50.00"));
        model.setModelId(1);

        vehicle = new Vehicle(user, model, "TN-01-EV-1001", new BigDecimal("80.00"));
        vehicle.setVehicleId(101);
        vehicle.setStatus("ACTIVE");
    }

    @Test
    void getUserVehicles_NoVehicles_ReturnsEmptyList() {
        when(vehicleRepository.findActiveByUserId(10)).thenReturn(Collections.emptyList());

        List<VehicleResponse> result = vehicleService.getUserVehicles(10);

        assertNotNull(result);
        assertTrue(result.isEmpty());
        verify(vehicleRepository).findActiveByUserId(10);
    }

    @Test
    void addVehicle_Success_ReturnsVehicleResponse() {
        VehicleRequest req = new VehicleRequest(1, "DL-01-EV-9999", new BigDecimal("85.00"));

        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(vehicleModelRepository.findById(1)).thenReturn(Optional.of(model));
        when(vehicleRepository.findByRegistrationNumber("DL-01-EV-9999")).thenReturn(Optional.empty());
        when(vehicleRepository.save(any(Vehicle.class))).thenAnswer(invocation -> {
            Vehicle v = invocation.getArgument(0);
            v.setVehicleId(102);
            return v;
        });

        VehicleResponse res = vehicleService.addVehicle(10, req);

        assertNotNull(res);
        assertEquals("DL-01-EV-9999", res.getRegistrationNumber());
        assertEquals("ACTIVE", vehicle.getStatus());
        verify(vehicleRepository).save(any(Vehicle.class));
    }

    @Test
    void addVehicle_AlreadyActiveRegistration_ThrowsConflictException() {
        VehicleRequest req = new VehicleRequest(1, "TN-01-EV-1001", new BigDecimal("85.00"));

        when(userRepository.findById(10)).thenReturn(Optional.of(user));
        when(vehicleModelRepository.findById(1)).thenReturn(Optional.of(model));
        when(vehicleRepository.findByRegistrationNumber("TN-01-EV-1001")).thenReturn(Optional.of(vehicle));

        assertThrows(ConflictException.class, () -> vehicleService.addVehicle(10, req));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void deleteVehicle_OwnershipCheck_ThrowsForbiddenException() {
        when(vehicleRepository.findById(101)).thenReturn(Optional.of(vehicle));

        assertThrows(ForbiddenException.class, () -> vehicleService.deleteVehicle(20, 101));
        verify(vehicleRepository, never()).save(any(Vehicle.class));
    }

    @Test
    void deleteVehicle_Success_SoftDeletesVehicle() {
        when(vehicleRepository.findById(101)).thenReturn(Optional.of(vehicle));

        vehicleService.deleteVehicle(10, 101);

        assertEquals("DELETED", vehicle.getStatus());
        verify(vehicleRepository).save(vehicle);
    }

    @Test
    void getVehicleById_DeletedVehicle_ThrowsResourceNotFoundException() {
        vehicle.setStatus("DELETED");
        when(vehicleRepository.findById(101)).thenReturn(Optional.of(vehicle));

        assertThrows(ResourceNotFoundException.class, () -> vehicleService.getVehicleById(10, 101));
    }
}
