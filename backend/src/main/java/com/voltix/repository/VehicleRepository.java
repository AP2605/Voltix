package com.voltix.repository;

import com.voltix.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Integer> {
    @Query("SELECT v FROM Vehicle v WHERE v.user.userId = :userId AND (v.status IS NULL OR v.status = 'ACTIVE')")
    List<Vehicle> findActiveByUserId(@Param("userId") Integer userId);

    List<Vehicle> findByUser_UserId(Integer userId);
    Optional<Vehicle> findByRegistrationNumber(String registrationNumber);
    boolean existsByRegistrationNumber(String registrationNumber);

    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END FROM Vehicle v WHERE v.registrationNumber = :reg AND (v.status IS NULL OR v.status = 'ACTIVE')")
    boolean existsActiveByRegistrationNumber(@Param("reg") String registrationNumber);

    Optional<Vehicle> findByVehicleIdAndUser_UserId(Integer vehicleId, Integer userId);
}
