-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: charger_release.sql
-- Description: Trigger 2: Automatically restores charger hardware status
--              to 'AVAILABLE' when a charging session concludes.
-- Table: charging_session (AFTER UPDATE)
-- ============================================================================

USE voltix_db;

DROP TRIGGER IF EXISTS trg_session_end_charger_available;

DELIMITER $$

CREATE TRIGGER trg_session_end_charger_available
AFTER UPDATE ON charging_session
FOR EACH ROW
BEGIN
    -- When end_time is populated (session finalized), restore charger status to AVAILABLE
    -- Only if charger is not currently under maintenance or offline
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        UPDATE charger
        SET status = 'AVAILABLE'
        WHERE charger_id = NEW.charger_id
          AND status IN ('OCCUPIED', 'RESERVED');
    END IF;
END$$

DELIMITER ;

SELECT 'Created trigger trg_session_end_charger_available successfully.' AS status;
