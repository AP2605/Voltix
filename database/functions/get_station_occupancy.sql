-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: get_station_occupancy.sql
-- Description: Computes current real-time utilization percentage of a station.
-- Formula: (Occupied + Reserved Chargers) / Total Active Chargers * 100
-- Safety: Protects against division by zero for stations with zero chargers.
-- ============================================================================

USE voltix_db;

DROP FUNCTION IF EXISTS get_station_occupancy;

DELIMITER $$

CREATE FUNCTION get_station_occupancy(p_station_id INT)
RETURNS DECIMAL(5, 2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_total_chargers INT DEFAULT 0;
    DECLARE v_occupied_chargers INT DEFAULT 0;
    DECLARE v_occupancy_pct DECIMAL(5, 2) DEFAULT 0.00;

    -- Count total chargers operational or assigned to the station (exclude OFFLINE if desired, or total installed)
    SELECT COUNT(*)
    INTO v_total_chargers
    FROM charger
    WHERE station_id = p_station_id;

    -- Handle zero chargers edge-case safely
    IF v_total_chargers = 0 THEN
        RETURN 0.00;
    END IF;

    -- Count chargers currently actively occupied or reserved
    SELECT COUNT(*)
    INTO v_occupied_chargers
    FROM charger
    WHERE station_id = p_station_id
      AND status IN ('OCCUPIED', 'RESERVED');

    -- Compute percentage
    SET v_occupancy_pct = (v_occupied_chargers / v_total_chargers) * 100.00;

    RETURN ROUND(v_occupancy_pct, 2);
END$$

DELIMITER ;

SELECT 'Created function get_station_occupancy successfully.' AS status;
