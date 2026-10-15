package com.voltix.repository;

import com.voltix.entity.PricingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PricingPlanRepository extends JpaRepository<PricingPlan, Integer> {
    Optional<PricingPlan> findByPlanName(String planName);
}
