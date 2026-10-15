package com.voltix.repository;

import com.voltix.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByStation_StationIdOrderByCreatedAtDesc(Integer stationId);
    List<Review> findByUser_UserIdOrderByCreatedAtDesc(Integer userId);
    Optional<Review> findByUser_UserIdAndStation_StationId(Integer userId, Integer stationId);
    boolean existsByUser_UserIdAndStation_StationId(Integer userId, Integer stationId);
}
