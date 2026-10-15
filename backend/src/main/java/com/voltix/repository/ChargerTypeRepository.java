package com.voltix.repository;

import com.voltix.entity.ChargerType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChargerTypeRepository extends JpaRepository<ChargerType, Integer> {
    Optional<ChargerType> findByConnectorType(String connectorType);
}
