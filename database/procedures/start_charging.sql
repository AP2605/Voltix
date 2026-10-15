-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: start_charging.sql
-- Description: Stored Procedure to initiate an active charging session.
-- Transitions:
--   - reservation.status: CONFIRMED -> ACTIVE
--   - charger.status: AVAILABLE / RESERVED -> OCCUPIED
--   - Creates initial charging_session and telemetry baseline meter reading
-- ============================================================================

USE voltix_db;

DROP PROCEDURE IF EXISTS start_charging;

DELIMITER $$

CREATE PROCEDURE start_charging(
    IN  p_reservation_id INT,
    OUT p_session_id     INT,
    OUT p_status_code    VARCHAR(30),
    OUT p_message        VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_res_status VARCHAR(20);
    DECLARE v_charger_id INT;
    DECLARE v_vehicle_id INT;
    DECLARE v_charger_status VARCHAR(20);
    DECLARE v_existing_session_id INT DEFAULT NULL;

    -- Error handler for unexpected SQL exceptions
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'SQL_EXCEPTION';
        SET p_message = 'Internal database exception encountered while initiating charging session.';
    END;

    SET p_session_id = NULL;
    SET p_status_code = 'INIT';
    SET p_message = '';

    -- 1. Begin Transaction
    START TRANSACTION;

    -- 2. Validate Reservation under row lock
    SELECT 
        status, 
        charger_id, 
        vehicle_id 
    INTO 
        v_res_status, 
        v_charger_id, 
        v_vehicle_id
    FROM reservation
    WHERE reservation_id = p_reservation_id
    FOR UPDATE;

    IF v_res_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'RESERVATION_NOT_FOUND';
        SET p_message = 'Reservation ID does not exist.';
        LEAVE proc_label;
    END IF;

    IF v_res_status NOT IN ('CONFIRMED', 'PENDING') THEN
        ROLLBACK;
        SET p_status_code = 'INVALID_RESERVATION_STATUS';
        SET p_message = CONCAT('Cannot start charging. Reservation is currently: ', v_res_status);
        LEAVE proc_label;
    END IF;

    -- 3. Check for Existing Session
    SELECT session_id INTO v_existing_session_id
    FROM charging_session
    WHERE reservation_id = p_reservation_id;

    IF v_existing_session_id IS NOT NULL THEN
        ROLLBACK;
        SET p_session_id = v_existing_session_id;
        SET p_status_code = 'SESSION_ALREADY_EXISTS';
        SET p_message = 'A charging session is already associated with this reservation.';
        LEAVE proc_label;
    END IF;

    -- 4. Validate Charger Availability under row lock
    SELECT status INTO v_charger_status
    FROM charger
    WHERE charger_id = v_charger_id
    FOR UPDATE;

    IF v_charger_status IN ('MAINTENANCE', 'OFFLINE') THEN
        ROLLBACK;
        SET p_status_code = 'CHARGER_DEFECTIVE';
        SET p_message = CONCAT('Charger is currently unavailable (Status: ', v_charger_status, ').');
        LEAVE proc_label;
    END IF;

    -- 5. Create Charging Session
    INSERT INTO charging_session (
        reservation_id,
        charger_id,
        vehicle_id,
        start_time,
        energy_consumed,
        duration_minutes,
        final_cost
    ) VALUES (
        p_reservation_id,
        v_charger_id,
        v_vehicle_id,
        NOW(),
        0.00,
        0,
        0.00
    );

    SET p_session_id = LAST_INSERT_ID();

    -- 6. Transition Reservation and Charger States
    UPDATE reservation
    SET status = 'ACTIVE'
    WHERE reservation_id = p_reservation_id;

    UPDATE charger
    SET status = 'OCCUPIED'
    WHERE charger_id = v_charger_id;

    -- 7. Initialize baseline meter reading (t=0)
    INSERT INTO meter_reading (
        session_id,
        reading_time,
        voltage,
        current,
        energy_kwh
    ) VALUES (
        p_session_id,
        NOW(),
        400.00,
        32.00,
        0.00
    );

    -- 8. Commit Transaction
    COMMIT;

    SET p_status_code = 'SUCCESS';
    SET p_message = 'Charging session started successfully.';
END$$

DELIMITER ;

SELECT 'Created procedure start_charging successfully.' AS status;
