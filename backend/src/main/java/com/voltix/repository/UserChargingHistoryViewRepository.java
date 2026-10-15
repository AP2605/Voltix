package com.voltix.repository;

import com.voltix.entity.UserChargingHistoryView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserChargingHistoryViewRepository extends JpaRepository<UserChargingHistoryView, Integer> {
    List<UserChargingHistoryView> findByUserIdOrderBySessionStartDesc(Integer userId);
    List<UserChargingHistoryView> findByStationIdOrderBySessionStartDesc(Integer stationId);
}
