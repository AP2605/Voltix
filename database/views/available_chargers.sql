-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: available_chargers.sql
-- Description: View 1: Public discovery view for active, operational, and
--              available charging points with connector details and baseline pricing.
-- ============================================================================

USE voltix_db;

DROP VIEW IF EXISTS available_chargers;

CREATE VIEW available_chargers AS
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    c.state,
    s.address,
    s.latitude,
    s.longitude,
    ch.charger_id,
    ch.charger_number,
    ct.connector_type,
    ct.power_rating AS power_kw,
    ch.status AS charger_status,
    -- Default standard tariff or current applicable base rate
    COALESCE(
        (SELECT pr.price_per_kwh 
         FROM pricing_rule pr 
         JOIN pricing_plan pp ON pr.plan_id = pp.plan_id 
         WHERE pp.plan_name = 'STANDARD' 
           AND pr.day_type = 'ALL' 
         LIMIT 1),
        14.00
    ) AS base_price_per_kwh
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
JOIN charger ch ON s.station_id = ch.station_id
JOIN charger_type ct ON ch.charger_type_id = ct.charger_type_id
WHERE s.status = 'ACTIVE'
  AND ch.status = 'AVAILABLE';

SELECT 'Created view available_chargers successfully.' AS status;
