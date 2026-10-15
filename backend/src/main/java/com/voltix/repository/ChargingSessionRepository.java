package com.voltix.repository;

import com.voltix.entity.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Integer> {
    List<ChargingSession> findByVehicle_User_UserIdOrderByStartTimeDesc(Integer userId);
    Optional<ChargingSession> findTopByVehicle_User_UserIdAndEndTimeIsNullOrderByStartTimeDesc(Integer userId);
    List<ChargingSession> findByCharger_Station_StationId(Integer stationId);
    Optional<ChargingSession> findByReservation_ReservationId(Integer reservationId);

    @Query("SELECT cs FROM ChargingSession cs WHERE cs.charger.station.operator.userId = :operatorId ORDER BY cs.startTime DESC")
    List<ChargingSession> findByOperatorId(@Param("operatorId") Integer operatorId);

    @Query("SELECT cs FROM ChargingSession cs WHERE cs.sessionId = :sessionId AND cs.vehicle.user.userId = :userId")
    Optional<ChargingSession> findBySessionIdAndUserId(@Param("sessionId") Integer sessionId, @Param("userId") Integer userId);
}
