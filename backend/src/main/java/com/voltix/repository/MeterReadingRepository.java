package com.voltix.repository;

import com.voltix.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MeterReadingRepository extends JpaRepository<MeterReading, Integer> {
    List<MeterReading> findBySession_SessionIdOrderByReadingTimeAsc(Integer sessionId);
}
