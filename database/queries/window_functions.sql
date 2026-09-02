-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: window_functions.sql
-- Description: Advanced analytical queries using SQL Window Functions:
--              RANK(), DENSE_RANK(), ROW_NUMBER(), SUM() OVER(), AVG() OVER(),
--              LAG(), and LEAD().
-- ============================================================================

USE voltix_db;

-- ----------------------------------------------------------------------------
-- 1. DENSE_RANK() & RANK() with PARTITION BY:
-- Rank charging stations by settled revenue within each respective city.
-- ----------------------------------------------------------------------------
SELECT 
    c.city_name,
    s.station_name,
    COALESCE(SUM(p.amount), 0.00) AS station_revenue_inr,
    RANK() OVER (
        PARTITION BY c.city_name 
        ORDER BY COALESCE(SUM(p.amount), 0.00) DESC
    ) AS city_rank_sparse,
    DENSE_RANK() OVER (
        PARTITION BY c.city_name 
        ORDER BY COALESCE(SUM(p.amount), 0.00) DESC
    ) AS city_rank_dense
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
LEFT JOIN charger ch ON s.station_id = ch.station_id
LEFT JOIN charging_session cs ON ch.charger_id = cs.charger_id
LEFT JOIN payment p ON cs.session_id = p.session_id AND p.payment_status = 'SUCCESS'
GROUP BY c.city_name, s.station_id, s.station_name
ORDER BY c.city_name ASC, station_revenue_inr DESC;

-- ----------------------------------------------------------------------------
-- 2. ROW_NUMBER() with PARTITION BY:
-- Enumerate each user's charging sessions chronologically from first to latest.
-- ----------------------------------------------------------------------------
SELECT 
    ROW_NUMBER() OVER (
        PARTITION BY u.user_id 
        ORDER BY cs.start_time ASC
    ) AS user_session_number,
    u.name AS customer_name,
    cs.session_id,
    cs.start_time,
    cs.energy_consumed AS energy_kwh,
    cs.final_cost AS cost_inr
FROM `user` u
JOIN vehicle v ON u.user_id = v.user_id
JOIN charging_session cs ON v.vehicle_id = cs.vehicle_id
WHERE cs.end_time IS NOT NULL
ORDER BY u.name ASC, user_session_number ASC;

-- ----------------------------------------------------------------------------
-- 3. SUM() OVER (ORDER BY):
-- Running cumulative total of network revenue settled over chronological time.
-- ----------------------------------------------------------------------------
SELECT 
    p.payment_id,
    p.payment_time,
    p.amount AS session_amount_inr,
    p.payment_method,
    SUM(p.amount) OVER (
        ORDER BY p.payment_time ASC 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS running_cumulative_revenue_inr
FROM payment p
WHERE p.payment_status = 'SUCCESS'
ORDER BY p.payment_time ASC;

-- ----------------------------------------------------------------------------
-- 4. AVG() OVER (PARTITION BY):
-- Benchmark individual session energy against the overall fleet average for that vehicle model.
-- ----------------------------------------------------------------------------
SELECT 
    cs.session_id,
    vm.model_name,
    v.registration_number,
    cs.energy_consumed AS session_energy_kwh,
    ROUND(
        AVG(cs.energy_consumed) OVER (PARTITION BY vm.model_id), 
        2
    ) AS model_avg_energy_kwh,
    ROUND(
        cs.energy_consumed - AVG(cs.energy_consumed) OVER (PARTITION BY vm.model_id),
        2
    ) AS variance_from_model_avg_kwh
FROM charging_session cs
JOIN vehicle v ON cs.vehicle_id = v.vehicle_id
JOIN vehicle_model vm ON v.model_id = vm.model_id
WHERE cs.end_time IS NOT NULL
ORDER BY vm.model_name ASC, cs.start_time ASC;

-- ----------------------------------------------------------------------------
-- 5. LAG() Function:
-- Analyze user repeat interval (gap in days between consecutive charging sessions).
-- ----------------------------------------------------------------------------
SELECT 
    u.name AS customer_name,
    v.registration_number,
    cs.start_time AS current_session_start,
    LAG(cs.start_time, 1) OVER (
        PARTITION BY v.vehicle_id 
        ORDER BY cs.start_time ASC
    ) AS previous_session_start,
    ROUND(
        TIMESTAMPDIFF(
            MINUTE,
            LAG(cs.start_time, 1) OVER (PARTITION BY v.vehicle_id ORDER BY cs.start_time ASC),
            cs.start_time
        ) / 1440.0,
        2
    ) AS days_since_last_charge
FROM `user` u
JOIN vehicle v ON u.user_id = v.user_id
JOIN charging_session cs ON v.vehicle_id = cs.vehicle_id
ORDER BY u.name ASC, cs.start_time ASC;

-- ----------------------------------------------------------------------------
-- 6. DENSE_RANK() Overall:
-- National leaderboard of EV vehicle models by total energy consumed.
-- ----------------------------------------------------------------------------
SELECT 
    DENSE_RANK() OVER (ORDER BY SUM(cs.energy_consumed) DESC) AS popularity_rank,
    vm.manufacturer,
    vm.model_name,
    COUNT(DISTINCT v.vehicle_id) AS registered_units,
    COUNT(cs.session_id) AS total_sessions,
    ROUND(SUM(cs.energy_consumed), 2) AS total_kwh_consumed,
    ROUND(SUM(cs.final_cost), 2) AS total_revenue_generated_inr
FROM vehicle_model vm
JOIN vehicle v ON vm.model_id = v.model_id
JOIN charging_session cs ON v.vehicle_id = cs.vehicle_id
WHERE cs.end_time IS NOT NULL
GROUP BY vm.model_id, vm.manufacturer, vm.model_name
ORDER BY popularity_rank ASC;
