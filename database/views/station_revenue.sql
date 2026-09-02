-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: station_revenue.sql
-- Description: View 2: Financial aggregate view reporting session count,
--              cumulative energy dispensed, and gross settled revenue per station.
-- ============================================================================

USE voltix_db;

DROP VIEW IF EXISTS station_revenue;

CREATE VIEW station_revenue AS
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    c.state,
    s.status AS station_status,
    COUNT(DISTINCT cs.session_id) AS total_sessions,
    COALESCE(SUM(cs.energy_consumed), 0.00) AS total_energy_kwh,
    COALESCE(SUM(CASE WHEN p.payment_status = 'SUCCESS' THEN p.amount ELSE 0.00 END), 0.00) AS total_revenue_inr,
    COALESCE(ROUND(AVG(cs.final_cost), 2), 0.00) AS avg_session_cost_inr
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
LEFT JOIN charger ch ON s.station_id = ch.station_id
LEFT JOIN charging_session cs ON ch.charger_id = cs.charger_id
LEFT JOIN payment p ON cs.session_id = p.session_id
GROUP BY 
    s.station_id, 
    s.station_name, 
    c.city_name, 
    c.state, 
    s.status;

SELECT 'Created view station_revenue successfully.' AS status;
