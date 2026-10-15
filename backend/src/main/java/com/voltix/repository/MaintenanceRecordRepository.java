package com.voltix.repository;

import com.voltix.entity.MaintenanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceRecordRepository extends JpaRepository<MaintenanceRecord, Integer> {
    List<MaintenanceRecord> findByRequest_RequestId(Integer requestId);
    List<MaintenanceRecord> findByTechnician_UserId(Integer technicianId);
}
