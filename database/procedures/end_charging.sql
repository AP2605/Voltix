-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: end_charging.sql
-- Description: Stored Procedure to conclude an active charging session.
-- Computes:
--   - Session elapsed duration in minutes
--   - Total energy consumed (kWh) derived from telemetry readings
--   - Final billing charge via calculate_charging_cost() function
--   - Restores charger availability and updates vehicle state-of-charge
-- ============================================================================

USE voltix_db;

DROP PROCEDURE IF EXISTS end_charging;

DELIMITER $$

CREATE PROCEDURE end_charging(
    IN  p_session_id  INT,
    OUT p_final_cost  DECIMAL(10, 2),
    OUT p_status_code VARCHAR(30),
    OUT p_message     VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_res_id INT;
    DECLARE v_charger_id INT;
    DECLARE v_vehicle_id INT;
    DECLARE v_start_time DATETIME;
    DECLARE v_end_time DATETIME;
    DECLARE v_existing_end DATETIME;
    DECLARE v_duration INT DEFAULT 0;
    DECLARE v_energy DECIMAL(8, 2) DEFAULT 0.00;
    DECLARE v_cost DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_power DECIMAL(6, 2) DEFAULT 30.00;
    DECLARE v_battery_cap DECIMAL(6, 2) DEFAULT 50.00;

    -- Error handler for unexpected SQL exceptions
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'SQL_EXCEPTION';
        SET p_message = 'Internal database exception encountered while ending charging session.';
    END;

    SET p_final_cost = 0.00;
    SET p_status_code = 'INIT';
    SET p_message = '';

    -- 1. Begin Transaction
    START TRANSACTION;

    -- 2. Validate Session and fetch metrics under row lock
    SELECT 
        reservation_id, 
        charger_id, 
        vehicle_id, 
        start_time, 
        end_time,
        energy_consumed
    INTO 
        v_res_id, 
        v_charger_id, 
        v_vehicle_id, 
        v_start_time, 
        v_existing_end,
        v_energy
    FROM charging_session
    WHERE session_id = p_session_id
    FOR UPDATE;

    IF v_start_time IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'SESSION_NOT_FOUND';
        SET p_message = 'Charging session ID does not exist.';
        LEAVE proc_label;
    END IF;

    IF v_existing_end IS NOT NULL THEN
        ROLLBACK;
        SET p_final_cost = (SELECT final_cost FROM charging_session WHERE session_id = p_session_id);
        SET p_status_code = 'ALREADY_COMPLETED';
        SET p_message = 'Charging session has already been completed.';
        LEAVE proc_label;
    END IF;

    -- 3. Calculate Elapsed Duration
    SET v_end_time = NOW();
    SET v_duration = TIMESTAMPDIFF(MINUTE, v_start_time, v_end_time);
    IF v_duration < 1 THEN
        SET v_duration = 1;
    END IF;

    -- 4. Calculate Energy Consumed from Telemetry Readings
    SELECT COALESCE(MAX(energy_kwh) - MIN(energy_kwh), 0.00)
    INTO v_energy
    FROM meter_reading
    WHERE session_id = p_session_id;

    -- If no meter readings exist or delta is zero, estimate based on charger hardware rating
    IF v_energy <= 0.00 THEN
        SELECT ct.power_rating
        INTO v_power
        FROM charger c
        JOIN charger_type ct ON c.charger_type_id = ct.charger_type_id
        WHERE c.charger_id = v_charger_id;

        IF v_power IS NULL THEN
            SET v_power = 22.00;
        END IF;

        SET v_energy = ROUND((v_power * (v_duration / 60.0)) * 0.85, 2);
    END IF;

    -- 5. Stage Session with calculated energy and duration
    UPDATE charging_session
    SET 
        end_time = v_end_time,
        duration_minutes = v_duration,
        energy_consumed = v_energy
    WHERE session_id = p_session_id;

    -- 6. Invoke Cost Calculation Function
    SET v_cost = calculate_charging_cost(p_session_id);

    -- 7. Persist Final Billing Cost
    UPDATE charging_session
    SET final_cost = v_cost
    WHERE session_id = p_session_id;

    -- 8. Complete Associated Reservation
    IF v_res_id IS NOT NULL THEN
        UPDATE reservation
        SET status = 'COMPLETED'
        WHERE reservation_id = v_res_id;
    END IF;

    -- 9. Release Charger back to AVAILABLE
    UPDATE charger
    SET status = 'AVAILABLE'
    WHERE charger_id = v_charger_id;

    -- 10. Update Vehicle State of Charge (Battery Percentage)
    SELECT vm.battery_capacity
    INTO v_battery_cap
    FROM vehicle v
    JOIN vehicle_model vm ON v.model_id = vm.model_id
    WHERE v.vehicle_id = v_vehicle_id;

    IF v_battery_cap > 0.00 THEN
        UPDATE vehicle
        SET battery_percentage = LEAST(100.00, battery_percentage + ROUND((v_energy / v_battery_cap) * 100.00, 2))
        WHERE vehicle_id = v_vehicle_id;
    END IF;

    -- 11. Commit Transaction
    COMMIT;

    SET p_final_cost = v_cost;
    SET p_status_code = 'SUCCESS';
    SET p_message = CONCAT('Charging ended successfully. Energy: ', v_energy, ' kWh, Duration: ', v_duration, ' mins, Cost: ₹', v_cost);
END$$

DELIMITER ;

SELECT 'Created procedure end_charging successfully.' AS status;
