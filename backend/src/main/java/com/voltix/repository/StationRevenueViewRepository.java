package com.voltix.repository;

import com.voltix.entity.StationRevenueView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StationRevenueViewRepository extends JpaRepository<StationRevenueView, Integer> {
    List<StationRevenueView> findByCityName(String cityName);
}
