package com.voltix.repository;

import com.voltix.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Integer> {
    List<Reservation> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    List<Reservation> findByUser_UserIdOrderByStartTimeDesc(Integer userId);
    List<Reservation> findByUser_UserId(Integer userId);
    List<Reservation> findByCharger_ChargerId(Integer chargerId);
    List<Reservation> findByStatus(String status);
    List<Reservation> findByUser_UserIdAndStatus(Integer userId, String status);
    Optional<Reservation> findByReservationIdAndUser_UserId(Integer reservationId, Integer userId);
}
