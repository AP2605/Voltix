-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: maintenance_alert.sql
-- Description: Trigger 4: Automated hardware health guard.
-- Behavior:
--   When a new maintenance ticket is logged:
--   1. Calculates frequency of recent failures for this charger (last 30 days).
--   2. If 3 or more tickets occur within 30 days, OR ticket priority is CRITICAL:
--      Automatically flips charger.status to 'MAINTENANCE' to protect equipment
--      and prevent consumers from booking defective hardware.
-- Recursion Safety:
--   The trigger executes AFTER INSERT on maintenance_request and issues an UPDATE
--   to the distinct charger table. No cyclic triggers exist on charger updating
--   maintenance_request, guaranteeing zero risk of trigger recursion.
-- ============================================================================

USE voltix_db;

DROP TRIGGER IF EXISTS trg_maintenance_alert;

DELIMITER $$

CREATE TRIGGER trg_maintenance_alert
AFTER INSERT ON maintenance_request
FOR EACH ROW
BEGIN
    DECLARE v_recent_failures INT DEFAULT 0;

    -- Count maintenance incidents filed for this charger within the past 30 days
    SELECT COUNT(*) INTO v_recent_failures
    FROM maintenance_request
    WHERE charger_id = NEW.charger_id
      AND created_at >= NOW() - INTERVAL 30 DAY;

    -- If 3 or more failures occur within 30 days, or if this incident is CRITICAL:
    -- Lock charger hardware status into MAINTENANCE
    IF v_recent_failures >= 3 OR NEW.priority = 'CRITICAL' THEN
        UPDATE charger
        SET status = 'MAINTENANCE'
        WHERE charger_id = NEW.charger_id;
    END IF;
END$$

DELIMITER ;

SELECT 'Created trigger trg_maintenance_alert successfully.' AS status;
