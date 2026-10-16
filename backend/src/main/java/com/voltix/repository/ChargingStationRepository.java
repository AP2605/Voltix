package com.voltix.repository;

import com.voltix.entity.ChargingStation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingStationRepository extends JpaRepository<ChargingStation, Integer>, JpaSpecificationExecutor<ChargingStation> {
    List<ChargingStation> findByStatus(String status);
    List<ChargingStation> findByCity_CityId(Integer cityId);
    List<ChargingStation> findByOperator_UserId(Integer operatorId);
    boolean existsByStationName(String stationName);
    Optional<ChargingStation> findByStationName(String stationName);
}
