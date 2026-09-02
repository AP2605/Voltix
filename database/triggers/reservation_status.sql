-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: reservation_status.sql
-- Description: Trigger managing hardware release upon reservation cancellation.
-- ============================================================================

USE voltix_db;

DROP TRIGGER IF EXISTS trg_reservation_cancelled_release_charger;

DELIMITER $$

CREATE TRIGGER trg_reservation_cancelled_release_charger
AFTER UPDATE ON reservation
FOR EACH ROW
BEGIN
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        UPDATE charger
        SET status = 'AVAILABLE'
        WHERE charger_id = NEW.charger_id
          AND status = 'RESERVED';
    END IF;
END$$

DELIMITER ;

SELECT 'Created trigger in reservation_status.sql successfully.' AS status;
