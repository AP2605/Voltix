-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: joins.sql
-- Description: Demonstrates relational join operations:
--              INNER JOIN, LEFT JOIN, and complex multi-table joins.
-- ============================================================================

USE voltix_db;

-- ----------------------------------------------------------------------------
-- 1. INNER JOIN (3 Tables):
-- Retrieve user profiles along with their registered vehicles and manufacturer specs.
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.name AS owner_name,
    u.phone AS contact_phone,
    v.registration_number,
    vm.manufacturer,
    vm.model_name,
    vm.battery_capacity AS battery_kwh,
    v.battery_percentage AS current_soc
FROM `user` u
INNER JOIN vehicle v ON u.user_id = v.user_id
INNER JOIN vehicle_model vm ON v.model_id = vm.model_id
ORDER BY u.name ASC, v.registration_number ASC;

-- ----------------------------------------------------------------------------
-- 2. INNER JOIN (4 Tables):
-- List all physical chargers mapped to stations, cities, and connector hardware.
-- ----------------------------------------------------------------------------
SELECT 
    s.station_name,
    c.city_name,
    ch.charger_number,
    ct.connector_type,
    ct.power_rating AS power_kw,
    ch.status AS operational_status
FROM charger ch
INNER JOIN charging_station s ON ch.station_id = s.station_id
INNER JOIN city c ON s.city_id = c.city_id
INNER JOIN charger_type ct ON ch.charger_type_id = ct.charger_type_id
ORDER BY c.city_name ASC, s.station_name ASC, ch.charger_number ASC;

-- ----------------------------------------------------------------------------
-- 3. LEFT JOIN:
-- Retrieve all charging stations and any reviews received.
-- Includes stations with zero reviews (ensures outer-join preservation).
-- ----------------------------------------------------------------------------
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    r.review_id,
    r.rating,
    r.comment,
    r.created_at AS review_date
FROM charging_station s
INNER JOIN city c ON s.city_id = c.city_id
LEFT JOIN review r ON s.station_id = r.station_id
ORDER BY s.station_name ASC, r.rating DESC;

-- ----------------------------------------------------------------------------
-- 4. LEFT JOIN:
-- List all chargers and their maintenance tickets.
-- Identifies reliable hardware units that have never experienced a breakdown.
-- ----------------------------------------------------------------------------
SELECT 
    ch.charger_id,
    ch.charger_number,
    s.station_name,
    mr.request_id,
    mr.issue_type,
    mr.priority,
    mr.status AS ticket_status
FROM charger ch
INNER JOIN charging_station s ON ch.station_id = s.station_id
LEFT JOIN maintenance_request mr ON ch.charger_id = mr.charger_id
ORDER BY ch.charger_id ASC;

-- ----------------------------------------------------------------------------
-- 5. Multi-Table Join (6 Tables):
-- Comprehensive booking audit: User, Vehicle, Reservation, Charger, Station, City.
-- ----------------------------------------------------------------------------
SELECT 
    r.reservation_id,
    u.name AS customer_name,
    v.registration_number,
    s.station_name,
    c.city_name,
    ch.charger_number,
    r.start_time,
    r.end_time,
    r.status AS booking_status
FROM reservation r
INNER JOIN `user` u ON r.user_id = u.user_id
INNER JOIN vehicle v ON r.vehicle_id = v.vehicle_id
INNER JOIN charger ch ON r.charger_id = ch.charger_id
INNER JOIN charging_station s ON ch.station_id = s.station_id
INNER JOIN city c ON s.city_id = c.city_id
ORDER BY r.start_time DESC;

-- ----------------------------------------------------------------------------
-- 6. Multi-Table Join (7 Tables):
-- End-to-end financial settlement audit connecting customer, vehicle, session,
-- payment receipt, charger, and operator.
-- ----------------------------------------------------------------------------
SELECT 
    p.payment_id,
    u.name AS customer_name,
    v.registration_number,
    vm.model_name AS vehicle_model,
    s.station_name,
    op.name AS station_operator,
    cs.energy_consumed AS energy_kwh,
    cs.duration_minutes,
    p.amount AS amount_paid_inr,
    p.payment_method,
    p.payment_status,
    p.payment_time
FROM payment p
INNER JOIN charging_session cs ON p.session_id = cs.session_id
INNER JOIN vehicle v ON cs.vehicle_id = v.vehicle_id
INNER JOIN vehicle_model vm ON v.model_id = vm.model_id
INNER JOIN `user` u ON p.user_id = u.user_id
INNER JOIN charger ch ON cs.charger_id = ch.charger_id
INNER JOIN charging_station s ON ch.station_id = s.station_id
INNER JOIN `user` op ON s.operator_id = op.user_id
ORDER BY p.payment_time DESC;

-- ----------------------------------------------------------------------------
-- 7. Multi-Table Join with Technician Work Orders (4 Tables):
-- Repair logs showing technician assignments, maintenance costs, and resolved issues.
-- ----------------------------------------------------------------------------
SELECT 
    mrec.maintenance_id,
    tech.name AS technician_name,
    ch.charger_number,
    s.station_name,
    mr.issue_type,
    mrec.cost AS repair_cost_inr,
    mrec.start_time,
    mrec.end_time,
    mrec.description
FROM maintenance_record mrec
INNER JOIN maintenance_request mr ON mrec.request_id = mr.request_id
INNER JOIN `user` tech ON mrec.technician_id = tech.user_id
INNER JOIN charger ch ON mr.charger_id = ch.charger_id
INNER JOIN charging_station s ON ch.station_id = s.station_id
ORDER BY mrec.start_time DESC;
