-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: charger_status.sql
-- Description: Triggers managing physical charger status transitions
--              based on session lifecycle events.
--   - trg_session_start_charger_occupied: Session Insert -> Charger OCCUPIED
--   - trg_session_end_charger_available: Session Finalized -> Charger AVAILABLE
-- ============================================================================

USE voltix_db;

DROP TRIGGER IF EXISTS trg_session_start_charger_occupied;
DROP TRIGGER IF EXISTS trg_session_end_charger_available;

DELIMITER $$

-- Trigger: When a charging session starts, set charger status to OCCUPIED
CREATE TRIGGER trg_session_start_charger_occupied
AFTER INSERT ON charging_session
FOR EACH ROW
BEGIN
    UPDATE charger
    SET status = 'OCCUPIED'
    WHERE charger_id = NEW.charger_id;
END$$

-- Trigger: When a charging session ends, restore charger status to AVAILABLE
CREATE TRIGGER trg_session_end_charger_available
AFTER UPDATE ON charging_session
FOR EACH ROW
BEGIN
    IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
        UPDATE charger
        SET status = 'AVAILABLE'
        WHERE charger_id = NEW.charger_id
          AND status IN ('OCCUPIED', 'RESERVED');
    END IF;
END$$

DELIMITER ;

SELECT 'Created triggers in charger_status.sql successfully.' AS status;
