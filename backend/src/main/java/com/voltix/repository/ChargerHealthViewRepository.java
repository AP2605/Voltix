package com.voltix.repository;

import com.voltix.entity.ChargerHealthView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargerHealthViewRepository extends JpaRepository<ChargerHealthView, Integer> {
    List<ChargerHealthView> findByStationId(Integer stationId);
    List<ChargerHealthView> findByCurrentHardwareStatus(String status);
}
