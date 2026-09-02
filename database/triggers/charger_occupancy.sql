-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: charger_occupancy.sql
-- Description: Trigger 1: Automatically transitions charger hardware status
--              to 'OCCUPIED' when a charging session begins.
-- Table: charging_session (AFTER INSERT)
-- ============================================================================

USE voltix_db;

DROP TRIGGER IF EXISTS trg_session_start_charger_occupied;

DELIMITER $$

CREATE TRIGGER trg_session_start_charger_occupied
AFTER INSERT ON charging_session
FOR EACH ROW
BEGIN
    -- Automatically set physical charger hardware status to OCCUPIED
    UPDATE charger
    SET status = 'OCCUPIED'
    WHERE charger_id = NEW.charger_id;
END$$

DELIMITER ;

SELECT 'Created trigger trg_session_start_charger_occupied successfully.' AS status;
