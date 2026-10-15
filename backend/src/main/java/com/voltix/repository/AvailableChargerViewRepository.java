package com.voltix.repository;

import com.voltix.entity.AvailableChargerView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AvailableChargerViewRepository extends JpaRepository<AvailableChargerView, Integer> {
    List<AvailableChargerView> findByCityName(String cityName);
    List<AvailableChargerView> findByConnectorType(String connectorType);
}
