-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: charger_health.sql
-- Description: View 3: Hardware maintenance health assessment dashboard.
--              Monitors failure frequency, active trouble tickets, latest
--              servicing date, and cumulative repair expenditure.
-- ============================================================================

USE voltix_db;

DROP VIEW IF EXISTS charger_health;

CREATE VIEW charger_health AS
SELECT 
    ch.charger_id,
    ch.charger_number,
    s.station_id,
    s.station_name,
    c.city_name,
    ct.connector_type,
    ct.power_rating AS power_kw,
    ch.status AS current_hardware_status,
    COUNT(DISTINCT mr.request_id) AS total_maintenance_requests,
    SUM(CASE WHEN mr.status IN ('OPEN', 'IN_PROGRESS') THEN 1 ELSE 0 END) AS active_open_issues,
    MAX(mrec.end_time) AS last_maintenance_date,
    COALESCE(SUM(mrec.cost), 0.00) AS total_maintenance_cost_inr
FROM charger ch
JOIN charging_station s ON ch.station_id = s.station_id
JOIN city c ON s.city_id = c.city_id
JOIN charger_type ct ON ch.charger_type_id = ct.charger_type_id
LEFT JOIN maintenance_request mr ON ch.charger_id = mr.charger_id
LEFT JOIN maintenance_record mrec ON mr.request_id = mrec.request_id
GROUP BY 
    ch.charger_id,
    ch.charger_number,
    s.station_id,
    s.station_name,
    c.city_name,
    ct.connector_type,
    ct.power_rating,
    ch.status;

SELECT 'Created view charger_health successfully.' AS status;
