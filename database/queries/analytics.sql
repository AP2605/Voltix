-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: analytics.sql
-- Description: Business Intelligence & Executive Operational Analytics:
--   1. Most utilized station
--   2. Most profitable station
--   3. Average charging cost
--   4. Average session duration
--   5. Peak charging hours
--   6. Highest energy-consuming vehicle model
--   7. Charger failure / maintenance ranking
--   8. Users with highest charging expenditure
--   9. Revenue by city
--   10. Revenue by month
--   11. Energy consumption by station & estimated green CO2 offset
--   12. Charger utilization percentage
--   13. Stations performing above city average revenue
-- ============================================================================

USE voltix_db;

-- ----------------------------------------------------------------------------
-- 1. Most Utilized Station (Ranked by session throughput & total charge time)
-- ----------------------------------------------------------------------------
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    COUNT(cs.session_id) AS total_sessions_handled,
    COALESCE(SUM(cs.duration_minutes), 0) AS total_charging_minutes,
    ROUND(COALESCE(SUM(cs.duration_minutes), 0) / 60.0, 1) AS total_charging_hours,
    ROUND(COALESCE(SUM(cs.energy_consumed), 0), 2) AS total_energy_kwh
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
JOIN charger ch ON s.station_id = ch.station_id
LEFT JOIN charging_session cs ON ch.charger_id = cs.charger_id
GROUP BY s.station_id, s.station_name, c.city_name
ORDER BY total_charging_minutes DESC, total_sessions_handled DESC;

-- ----------------------------------------------------------------------------
-- 2. Most Profitable Station (Gross settled financial turnover)
-- ----------------------------------------------------------------------------
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    COUNT(DISTINCT p.payment_id) AS paid_transactions,
    ROUND(COALESCE(SUM(p.amount), 0.00), 2) AS gross_revenue_inr,
    ROUND(COALESCE(AVG(p.amount), 0.00), 2) AS avg_revenue_per_session_inr
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
JOIN charger ch ON s.station_id = ch.station_id
JOIN charging_session cs ON ch.charger_id = cs.charger_id
JOIN payment p ON cs.session_id = p.session_id AND p.payment_status = 'SUCCESS'
GROUP BY s.station_id, s.station_name, c.city_name
ORDER BY gross_revenue_inr DESC;

-- ----------------------------------------------------------------------------
-- 3. Average Charging Cost (Overall, per kWh, and per session)
-- ----------------------------------------------------------------------------
SELECT 
    ROUND(AVG(final_cost), 2) AS avg_session_cost_inr,
    ROUND(SUM(final_cost) / SUM(energy_consumed), 2) AS effective_avg_price_per_kwh_inr,
    ROUND(MIN(final_cost), 2) AS min_session_cost_inr,
    ROUND(MAX(final_cost), 2) AS max_session_cost_inr
FROM charging_session
WHERE end_time IS NOT NULL AND energy_consumed > 0;

-- ----------------------------------------------------------------------------
-- 4. Average Session Duration by Connector Speed Tier
-- ----------------------------------------------------------------------------
SELECT 
    ct.connector_type,
    ct.power_rating AS rated_kw,
    COUNT(cs.session_id) AS session_count,
    ROUND(AVG(cs.duration_minutes), 1) AS avg_duration_mins,
    ROUND(AVG(cs.energy_consumed), 2) AS avg_energy_dispensed_kwh,
    ROUND(AVG(cs.final_cost), 2) AS avg_cost_inr
FROM charger_type ct
JOIN charger ch ON ct.charger_type_id = ch.charger_type_id
JOIN charging_session cs ON ch.charger_id = cs.charger_id
WHERE cs.end_time IS NOT NULL
GROUP BY ct.charger_type_id, ct.connector_type, ct.power_rating
ORDER BY ct.power_rating DESC;

-- ----------------------------------------------------------------------------
-- 5. Peak Charging Hours (Hourly distribution of session starts)
-- ----------------------------------------------------------------------------
SELECT 
    HOUR(start_time) AS hour_of_day,
    CASE 
        WHEN HOUR(start_time) BETWEEN 9 AND 12 THEN 'Morning Peak (09:00 - 12:00)'
        WHEN HOUR(start_time) BETWEEN 18 AND 22 THEN 'Evening Peak (18:00 - 22:00)'
        WHEN HOUR(start_time) BETWEEN 23 AND 23 OR HOUR(start_time) BETWEEN 0 AND 5 THEN 'Night Off-Peak (23:00 - 06:00)'
        ELSE 'Standard Daytime'
    END AS tariff_window,
    COUNT(session_id) AS sessions_initiated,
    ROUND(SUM(energy_consumed), 2) AS total_energy_kwh,
    ROUND(SUM(final_cost), 2) AS total_billed_inr
FROM charging_session
GROUP BY HOUR(start_time), tariff_window
ORDER BY sessions_initiated DESC, hour_of_day ASC;

-- ----------------------------------------------------------------------------
-- 6. Highest Energy-Consuming Vehicle Model
-- ----------------------------------------------------------------------------
SELECT 
    vm.model_id,
    vm.manufacturer,
    vm.model_name,
    COUNT(cs.session_id) AS charging_events,
    ROUND(SUM(cs.energy_consumed), 2) AS total_kwh_consumed,
    ROUND(AVG(cs.energy_consumed), 2) AS avg_kwh_per_charge,
    ROUND(SUM(cs.final_cost), 2) AS total_cost_inr
FROM vehicle_model vm
JOIN vehicle v ON vm.model_id = v.model_id
JOIN charging_session cs ON v.vehicle_id = cs.vehicle_id
WHERE cs.end_time IS NOT NULL
GROUP BY vm.model_id, vm.manufacturer, vm.model_name
ORDER BY total_kwh_consumed DESC;

-- ----------------------------------------------------------------------------
-- 7. Charger Failure & Maintenance Ranking (Unreliability Index)
-- ----------------------------------------------------------------------------
SELECT 
    ch.charger_id,
    ch.charger_number,
    s.station_name,
    c.city_name,
    COUNT(DISTINCT mr.request_id) AS total_failures_logged,
    SUM(CASE WHEN mr.priority = 'CRITICAL' THEN 1 ELSE 0 END) AS critical_incidents,
    COALESCE(SUM(mrec.cost), 0.00) AS total_repair_expenditure_inr,
    ch.status AS current_status
FROM charger ch
JOIN charging_station s ON ch.station_id = s.station_id
JOIN city c ON s.city_id = c.city_id
LEFT JOIN maintenance_request mr ON ch.charger_id = mr.charger_id
LEFT JOIN maintenance_record mrec ON mr.request_id = mrec.request_id
GROUP BY ch.charger_id, ch.charger_number, s.station_name, c.city_name, ch.status
HAVING COUNT(DISTINCT mr.request_id) > 0
ORDER BY total_failures_logged DESC, critical_incidents DESC, total_repair_expenditure_inr DESC;

-- ----------------------------------------------------------------------------
-- 8. Users with Highest Charging Expenditure (VIP Customer Portfolio)
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.name AS customer_name,
    u.email,
    u.phone,
    COUNT(DISTINCT v.vehicle_id) AS registered_evs,
    COUNT(DISTINCT cs.session_id) AS total_sessions,
    ROUND(SUM(p.amount), 2) AS total_expenditure_inr,
    ROUND(AVG(p.amount), 2) AS avg_spend_per_charge_inr,
    w.balance AS current_wallet_balance_inr
FROM `user` u
JOIN payment p ON u.user_id = p.user_id AND p.payment_status = 'SUCCESS'
JOIN charging_session cs ON p.session_id = cs.session_id
LEFT JOIN vehicle v ON u.user_id = v.user_id
LEFT JOIN wallet w ON u.user_id = w.user_id
GROUP BY u.user_id, u.name, u.email, u.phone, w.balance
ORDER BY total_expenditure_inr DESC
LIMIT 10;

-- ----------------------------------------------------------------------------
-- 9. Regional Revenue Breakdown by City
-- ----------------------------------------------------------------------------
SELECT 
    c.city_name,
    c.state,
    COUNT(DISTINCT s.station_id) AS station_count,
    COUNT(DISTINCT ch.charger_id) AS installed_chargers,
    COUNT(DISTINCT cs.session_id) AS completed_sessions,
    ROUND(COALESCE(SUM(cs.energy_consumed), 0), 2) AS total_energy_kwh,
    ROUND(COALESCE(SUM(p.amount), 0), 2) AS gross_revenue_inr,
    ROUND(COALESCE(SUM(p.amount), 0) / COUNT(DISTINCT s.station_id), 2) AS avg_revenue_per_station_inr
FROM city c
JOIN charging_station s ON c.city_id = s.city_id
JOIN charger ch ON s.station_id = ch.station_id
LEFT JOIN charging_session cs ON ch.charger_id = cs.charger_id AND cs.end_time IS NOT NULL
LEFT JOIN payment p ON cs.session_id = p.session_id AND p.payment_status = 'SUCCESS'
GROUP BY c.city_id, c.city_name, c.state
ORDER BY gross_revenue_inr DESC;

-- ----------------------------------------------------------------------------
-- 10. Revenue by Month (Monthly Trend & Performance Tracking)
-- ----------------------------------------------------------------------------
SELECT 
    DATE_FORMAT(p.payment_time, '%Y-%m') AS billing_month,
    COUNT(p.payment_id) AS transactions_settled,
    ROUND(SUM(p.amount), 2) AS monthly_revenue_inr,
    ROUND(AVG(p.amount), 2) AS avg_transaction_value_inr,
    ROUND(SUM(cs.energy_consumed), 2) AS monthly_energy_dispensed_kwh
FROM payment p
JOIN charging_session cs ON p.session_id = cs.session_id
WHERE p.payment_status = 'SUCCESS'
GROUP BY DATE_FORMAT(p.payment_time, '%Y-%m')
ORDER BY billing_month ASC;

-- ----------------------------------------------------------------------------
-- 11. Energy Consumption by Station & Environmental CO2 Offset
-- (Factor: 0.82 kg CO2 avoided per kWh charged compared to petrol/diesel ICE)
-- ----------------------------------------------------------------------------
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    COUNT(cs.session_id) AS sessions_completed,
    ROUND(COALESCE(SUM(cs.energy_consumed), 0), 2) AS total_energy_dispensed_kwh,
    ROUND(COALESCE(SUM(cs.energy_consumed), 0) * 0.82, 2) AS co2_reduction_kg,
    ROUND((COALESCE(SUM(cs.energy_consumed), 0) * 0.82) / 1000.0, 3) AS co2_reduction_metric_tons
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
JOIN charger ch ON s.station_id = ch.station_id
LEFT JOIN charging_session cs ON ch.charger_id = cs.charger_id AND cs.end_time IS NOT NULL
GROUP BY s.station_id, s.station_name, c.city_name
ORDER BY total_energy_dispensed_kwh DESC;

-- ----------------------------------------------------------------------------
-- 12. Charger Utilization Percentage
-- (Active charging duration / total operating window over 30 days)
-- Formula: (Total Charging Minutes) / (30 days * 24 hrs * 60 mins = 43,200 mins) * 100
-- ----------------------------------------------------------------------------
SELECT 
    ch.charger_id,
    ch.charger_number,
    s.station_name,
    ct.connector_type,
    ct.power_rating AS power_kw,
    ch.status AS current_status,
    COALESCE(SUM(cs.duration_minutes), 0) AS total_active_charging_minutes,
    ROUND(
        (COALESCE(SUM(cs.duration_minutes), 0) / 43200.0) * 100.0,
        2
    ) AS monthly_utilization_percentage
FROM charger ch
JOIN charging_station s ON ch.station_id = s.station_id
JOIN charger_type ct ON ch.charger_type_id = ct.charger_type_id
LEFT JOIN charging_session cs ON ch.charger_id = cs.charger_id
GROUP BY ch.charger_id, ch.charger_number, s.station_name, ct.connector_type, ct.power_rating, ch.status
ORDER BY monthly_utilization_percentage DESC;

-- ----------------------------------------------------------------------------
-- 13. Stations Performing Above Their Respective City Average Revenue
-- (Advanced CTE / Window Comparison)
-- ----------------------------------------------------------------------------
WITH StationRevenueCTE AS (
    SELECT 
        s.station_id,
        s.station_name,
        c.city_name,
        c.city_id,
        COALESCE(SUM(p.amount), 0.00) AS station_revenue
    FROM charging_station s
    JOIN city c ON s.city_id = c.city_id
    JOIN charger ch ON s.station_id = ch.station_id
    LEFT JOIN charging_session cs ON ch.charger_id = cs.charger_id
    LEFT JOIN payment p ON cs.session_id = p.session_id AND p.payment_status = 'SUCCESS'
    GROUP BY s.station_id, s.station_name, c.city_name, c.city_id
),
CityAvgRevenueCTE AS (
    SELECT 
        city_id,
        AVG(station_revenue) AS city_avg_revenue
    FROM StationRevenueCTE
    GROUP BY city_id
)
SELECT 
    sr.station_name,
    sr.city_name,
    ROUND(sr.station_revenue, 2) AS station_revenue_inr,
    ROUND(car.city_avg_revenue, 2) AS city_benchmark_avg_inr,
    ROUND(sr.station_revenue - car.city_avg_revenue, 2) AS surplus_over_city_avg_inr
FROM StationRevenueCTE sr
JOIN CityAvgRevenueCTE car ON sr.city_id = car.city_id
WHERE sr.station_revenue > car.city_avg_revenue
ORDER BY surplus_over_city_avg_inr DESC;
