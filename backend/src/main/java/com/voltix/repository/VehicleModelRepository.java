package com.voltix.repository;

import com.voltix.entity.VehicleModel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VehicleModelRepository extends JpaRepository<VehicleModel, Integer> {
    Optional<VehicleModel> findByManufacturerAndModelName(String manufacturer, String modelName);
}
