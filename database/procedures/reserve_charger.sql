-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: reserve_charger.sql
-- Description: ACID-compliant Stored Procedure to reserve a charging point.
-- Enforces:
--   1. User existence and account active status
--   2. Vehicle ownership validation
--   3. Charger hardware operational status
--   4. Valid chronological time intervals (start < end, not in the past)
--   5. Strict overlap prevention using row-level locking (SELECT ... FOR UPDATE)
--   6. Automatic transactional rollback on any constraint violation
-- ============================================================================

USE voltix_db;

DROP PROCEDURE IF EXISTS reserve_charger;

DELIMITER $$

CREATE PROCEDURE reserve_charger(
    IN  p_user_id        INT,
    IN  p_vehicle_id     INT,
    IN  p_charger_id     INT,
    IN  p_start_time     DATETIME,
    IN  p_end_time       DATETIME,
    OUT p_reservation_id INT,
    OUT p_status_code    VARCHAR(30),
    OUT p_message        VARCHAR(255)
)
proc_label: BEGIN
    DECLARE v_user_count INT DEFAULT 0;
    DECLARE v_vehicle_count INT DEFAULT 0;
    DECLARE v_charger_status VARCHAR(20) DEFAULT NULL;
    DECLARE v_overlap_count INT DEFAULT 0;

    -- Error handler for unexpected SQL exceptions
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_status_code = 'SQL_EXCEPTION';
        SET p_message = 'Internal database exception encountered during reservation.';
    END;

    -- Default output values
    SET p_reservation_id = NULL;
    SET p_status_code = 'INIT';
    SET p_message = '';

    -- 1. Validate User
    SELECT COUNT(*) INTO v_user_count
    FROM `user`
    WHERE user_id = p_user_id AND status = 'ACTIVE';

    IF v_user_count = 0 THEN
        SET p_status_code = 'INVALID_USER';
        SET p_message = 'User does not exist or account is inactive/suspended.';
        LEAVE proc_label;
    END IF;

    -- 2. Validate Vehicle Ownership
    SELECT COUNT(*) INTO v_vehicle_count
    FROM vehicle
    WHERE vehicle_id = p_vehicle_id AND user_id = p_user_id;

    IF v_vehicle_count = 0 THEN
        SET p_status_code = 'INVALID_VEHICLE';
        SET p_message = 'Vehicle does not exist or does not belong to the specified user.';
        LEAVE proc_label;
    END IF;

    -- 3. Validate Time Interval
    IF p_start_time >= p_end_time THEN
        SET p_status_code = 'INVALID_TIME_RANGE';
        SET p_message = 'Reservation start time must be strictly before end time.';
        LEAVE proc_label;
    END IF;

    IF p_start_time < NOW() - INTERVAL 10 MINUTE THEN
        SET p_status_code = 'TIME_IN_PAST';
        SET p_message = 'Reservation start time cannot be in the past.';
        LEAVE proc_label;
    END IF;

    -- 4. Begin Transaction and Lock Charger Row for concurrency control
    START TRANSACTION;

    SELECT status INTO v_charger_status
    FROM charger
    WHERE charger_id = p_charger_id
    FOR UPDATE;

    IF v_charger_status IS NULL THEN
        ROLLBACK;
        SET p_status_code = 'CHARGER_NOT_FOUND';
        SET p_message = 'Specified charger does not exist.';
        LEAVE proc_label;
    END IF;

    IF v_charger_status IN ('MAINTENANCE', 'OFFLINE') THEN
        ROLLBACK;
        SET p_status_code = 'CHARGER_UNAVAILABLE';
        SET p_message = CONCAT('Charger is currently out of service (Status: ', v_charger_status, ').');
        LEAVE proc_label;
    END IF;

    -- 5. Strict Overlap Detection: (StartA < EndB) AND (EndA > StartB)
    SELECT COUNT(*) INTO v_overlap_count
    FROM reservation
    WHERE charger_id = p_charger_id
      AND status IN ('PENDING', 'CONFIRMED', 'ACTIVE')
      AND p_start_time < end_time
      AND p_end_time > start_time
    FOR UPDATE;

    IF v_overlap_count > 0 THEN
        ROLLBACK;
        SET p_status_code = 'SLOT_OVERLAP';
        SET p_message = 'Charger already has a conflicting reservation for the selected time slot.';
        LEAVE proc_label;
    END IF;

    -- 6. Insert Confirmed Reservation
    INSERT INTO reservation (
        user_id,
        vehicle_id,
        charger_id,
        start_time,
        end_time,
        status,
        created_at
    ) VALUES (
        p_user_id,
        p_vehicle_id,
        p_charger_id,
        p_start_time,
        p_end_time,
        'CONFIRMED',
        NOW()
    );

    SET p_reservation_id = LAST_INSERT_ID();

    -- 7. If booking starts immediately (within 15 minutes), mark charger as RESERVED
    IF p_start_time <= NOW() + INTERVAL 15 MINUTE AND v_charger_status = 'AVAILABLE' THEN
        UPDATE charger
        SET status = 'RESERVED'
        WHERE charger_id = p_charger_id;
    END IF;

    -- 8. Commit Transaction
    COMMIT;

    SET p_status_code = 'SUCCESS';
    SET p_message = 'Reservation successfully confirmed.';
END$$

DELIMITER ;

SELECT 'Created procedure reserve_charger successfully.' AS status;
