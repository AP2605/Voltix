package com.voltix.service;

import com.voltix.dto.ChargerResponse;
import com.voltix.entity.AvailableChargerView;
import com.voltix.entity.Charger;
import com.voltix.exception.ResourceNotFoundException;
import com.voltix.repository.AvailableChargerViewRepository;
import com.voltix.repository.ChargerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChargerService {

    private final ChargerRepository chargerRepository;
    private final AvailableChargerViewRepository availableChargerViewRepository;

    public ChargerService(ChargerRepository chargerRepository,
                          AvailableChargerViewRepository availableChargerViewRepository) {
        this.chargerRepository = chargerRepository;
        this.availableChargerViewRepository = availableChargerViewRepository;
    }

    @Transactional(readOnly = true)
    public ChargerResponse getChargerById(Integer chargerId) {
        Charger charger = chargerRepository.findById(chargerId)
                .orElseThrow(() -> new ResourceNotFoundException("Charger", "id", chargerId));
        return mapToDto(charger);
    }

    @Transactional(readOnly = true)
    public List<ChargerResponse> getChargersByStation(Integer stationId) {
        return chargerRepository.findByStation_StationId(stationId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AvailableChargerView> getAvailableChargers() {
        return availableChargerViewRepository.findAll();
    }

    private ChargerResponse mapToDto(Charger ch) {
        return new ChargerResponse(
                ch.getChargerId(),
                ch.getStation().getStationId(),
                ch.getChargerNumber(),
                ch.getChargerType().getConnectorType(),
                ch.getChargerType().getPowerRating(),
                ch.getStatus(),
                ch.getChargerType().getPowerRating().compareTo(new BigDecimal("50")) > 0
                        ? new BigDecimal("17.50") : new BigDecimal("14.00")
        );
    }
}
