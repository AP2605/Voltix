-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: subqueries.sql
-- Description: Demonstrates nested subqueries, correlated subqueries,
--              scalar subqueries, and EXISTS / NOT EXISTS conditions.
-- ============================================================================

USE voltix_db;

-- ----------------------------------------------------------------------------
-- 1. Subquery in HAVING:
-- Stations earning more than the average station revenue across the network.
-- ----------------------------------------------------------------------------
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    SUM(p.amount) AS station_total_revenue_inr
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
JOIN charger ch ON s.station_id = ch.station_id
JOIN charging_session cs ON ch.charger_id = cs.charger_id
JOIN payment p ON cs.session_id = p.session_id AND p.payment_status = 'SUCCESS'
GROUP BY s.station_id, s.station_name, c.city_name
HAVING SUM(p.amount) > (
    -- Subquery: Compute overall average revenue per revenue-generating station
    SELECT AVG(station_rev)
    FROM (
        SELECT SUM(p2.amount) AS station_rev
        FROM charging_station s2
        JOIN charger ch2 ON s2.station_id = ch2.station_id
        JOIN charging_session cs2 ON ch2.charger_id = cs2.charger_id
        JOIN payment p2 ON cs2.session_id = p2.session_id AND p2.payment_status = 'SUCCESS'
        GROUP BY s2.station_id
    ) AS avg_station_calc
)
ORDER BY station_total_revenue_inr DESC;

-- ----------------------------------------------------------------------------
-- 2. Subquery in WHERE:
-- Users whose charging expenditure is above the average customer expenditure.
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.name AS user_name,
    u.email,
    user_totals.total_spent_inr
FROM `user` u
JOIN (
    SELECT user_id, SUM(amount) AS total_spent_inr
    FROM payment
    WHERE payment_status = 'SUCCESS'
    GROUP BY user_id
) AS user_totals ON u.user_id = user_totals.user_id
WHERE user_totals.total_spent_inr > (
    -- Subquery: Overall average spend per customer who made payments
    SELECT AVG(total_spent)
    FROM (
        SELECT SUM(amount) AS total_spent
        FROM payment
        WHERE payment_status = 'SUCCESS'
        GROUP BY user_id
    ) AS avg_spend_calc
)
ORDER BY user_totals.total_spent_inr DESC;

-- ----------------------------------------------------------------------------
-- 3. Subquery with Aggregation:
-- Chargers with a maintenance incident count strictly above network average.
-- ----------------------------------------------------------------------------
SELECT 
    ch.charger_id,
    ch.charger_number,
    s.station_name,
    c.city_name,
    COUNT(mr.request_id) AS maintenance_ticket_count
FROM charger ch
JOIN charging_station s ON ch.station_id = s.station_id
JOIN city c ON s.city_id = c.city_id
JOIN maintenance_request mr ON ch.charger_id = mr.charger_id
GROUP BY ch.charger_id, ch.charger_number, s.station_name, c.city_name
HAVING COUNT(mr.request_id) > (
    -- Subquery: Average maintenance tickets across all chargers with reported issues
    SELECT AVG(ticket_count)
    FROM (
        SELECT COUNT(request_id) AS ticket_count
        FROM maintenance_request
        GROUP BY charger_id
    ) AS avg_tickets
)
ORDER BY maintenance_ticket_count DESC;

-- ----------------------------------------------------------------------------
-- 4. Correlated Subquery / Multi-Station Charging:
-- Vehicles that have charged at 2 or more distinct charging stations.
-- (Demonstrates cross-station fleet mobility analysis)
-- ----------------------------------------------------------------------------
SELECT 
    v.vehicle_id,
    v.registration_number,
    vm.manufacturer,
    vm.model_name,
    u.name AS owner_name,
    COUNT(DISTINCT ch.station_id) AS distinct_stations_visited
FROM vehicle v
JOIN vehicle_model vm ON v.model_id = vm.model_id
JOIN `user` u ON v.user_id = u.user_id
JOIN charging_session cs ON v.vehicle_id = cs.vehicle_id
JOIN charger ch ON cs.charger_id = ch.charger_id
GROUP BY v.vehicle_id, v.registration_number, vm.manufacturer, vm.model_name, u.name
HAVING COUNT(DISTINCT ch.station_id) >= 2
ORDER BY distinct_stations_visited DESC;

-- ----------------------------------------------------------------------------
-- 5. NOT EXISTS (Correlated Subquery):
-- High-reliability chargers that have NEVER logged any maintenance incidents.
-- ----------------------------------------------------------------------------
SELECT 
    ch.charger_id,
    ch.charger_number,
    s.station_name,
    ct.connector_type,
    ct.power_rating AS power_kw,
    ch.status
FROM charger ch
JOIN charging_station s ON ch.station_id = s.station_id
JOIN charger_type ct ON ch.charger_type_id = ct.charger_type_id
WHERE NOT EXISTS (
    SELECT 1 
    FROM maintenance_request mr
    WHERE mr.charger_id = ch.charger_id
)
ORDER BY ch.charger_id ASC;

-- ----------------------------------------------------------------------------
-- 6. Scalar Subquery in SELECT:
-- Station revenue contribution percentage relative to total network turnover.
-- ----------------------------------------------------------------------------
SELECT 
    s.station_name,
    c.city_name,
    COALESCE(SUM(p.amount), 0.00) AS station_revenue_inr,
    ROUND(
        (COALESCE(SUM(p.amount), 0.00) / (SELECT SUM(amount) FROM payment WHERE payment_status = 'SUCCESS')) * 100.00,
        2
    ) AS pct_of_network_revenue
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
JOIN charger ch ON s.station_id = ch.station_id
JOIN charging_session cs ON ch.charger_id = cs.charger_id
JOIN payment p ON cs.session_id = p.session_id AND p.payment_status = 'SUCCESS'
GROUP BY s.station_id, s.station_name, c.city_name
ORDER BY station_revenue_inr DESC;
