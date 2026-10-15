package com.voltix.repository;

import com.voltix.entity.MaintenanceRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRequestRepository extends JpaRepository<MaintenanceRequest, Integer> {
    List<MaintenanceRequest> findByCharger_Station_Operator_UserId(Integer operatorId);
    List<MaintenanceRequest> findByTechnician_UserId(Integer technicianId);
    List<MaintenanceRequest> findByStatus(String status);
    List<MaintenanceRequest> findByCharger_ChargerId(Integer chargerId);
    List<MaintenanceRequest> findByCharger_Station_StationId(Integer stationId);
}
