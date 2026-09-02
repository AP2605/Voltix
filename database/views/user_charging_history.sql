-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: user_charging_history.sql
-- Description: View 4: Complete end-to-end user charging timeline audit.
--              Joins user, vehicle, model, station, charger, session, and payment.
-- ============================================================================

USE voltix_db;

DROP VIEW IF EXISTS user_charging_history;

CREATE VIEW user_charging_history AS
SELECT 
    u.user_id,
    u.name AS user_name,
    u.email AS user_email,
    u.phone AS user_phone,
    v.vehicle_id,
    v.registration_number,
    vm.manufacturer,
    vm.model_name,
    s.station_id,
    s.station_name,
    c.city_name,
    ch.charger_id,
    ch.charger_number,
    ct.connector_type,
    cs.session_id,
    cs.start_time AS session_start,
    cs.end_time AS session_end,
    cs.duration_minutes,
    cs.energy_consumed AS energy_kwh,
    cs.final_cost AS cost_inr,
    p.payment_id,
    COALESCE(p.payment_method, 'UNPAID') AS payment_method,
    COALESCE(p.payment_status, 'PENDING') AS payment_status,
    p.payment_time
FROM `user` u
JOIN vehicle v ON u.user_id = v.user_id
JOIN vehicle_model vm ON v.model_id = vm.model_id
JOIN charging_session cs ON v.vehicle_id = cs.vehicle_id
JOIN charger ch ON cs.charger_id = ch.charger_id
JOIN charging_station s ON ch.station_id = s.station_id
JOIN city c ON s.city_id = c.city_id
JOIN charger_type ct ON ch.charger_type_id = ct.charger_type_id
LEFT JOIN payment p ON cs.session_id = p.session_id;

SELECT 'Created view user_charging_history successfully.' AS status;
