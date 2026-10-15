package com.voltix.repository;

import com.voltix.entity.Charger;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargerRepository extends JpaRepository<Charger, Integer> {
    List<Charger> findByStation_StationId(Integer stationId);
    List<Charger> findByStatus(String status);
    List<Charger> findByStation_StationIdAndStatus(Integer stationId, String status);
    List<Charger> findByStation_Operator_UserId(Integer operatorId);
    Optional<Charger> findByStation_StationIdAndChargerNumber(Integer stationId, String chargerNumber);
}
