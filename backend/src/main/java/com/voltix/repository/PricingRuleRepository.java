package com.voltix.repository;

import com.voltix.entity.PricingRule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Integer> {
    List<PricingRule> findByPlan_PlanId(Integer planId);
}
