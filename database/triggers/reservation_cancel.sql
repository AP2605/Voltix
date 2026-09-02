-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: reservation_cancel.sql
-- Description: Trigger 3: Automatically releases charger hardware when
--              a pending or confirmed booking is cancelled.
-- Table: reservation (AFTER UPDATE)
-- ============================================================================

USE voltix_db;

DROP TRIGGER IF EXISTS trg_reservation_cancelled_release_charger;

DELIMITER $$

CREATE TRIGGER trg_reservation_cancelled_release_charger
AFTER UPDATE ON reservation
FOR EACH ROW
BEGIN
    -- If a booking status transitions to CANCELLED and the charger was RESERVED,
    -- release the charger back to AVAILABLE
    IF NEW.status = 'CANCELLED' AND OLD.status != 'CANCELLED' THEN
        UPDATE charger
        SET status = 'AVAILABLE'
        WHERE charger_id = NEW.charger_id
          AND status = 'RESERVED';
    END IF;
END$$

DELIMITER ;

SELECT 'Created trigger trg_reservation_cancelled_release_charger successfully.' AS status;
