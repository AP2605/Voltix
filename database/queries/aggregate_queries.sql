-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: aggregate_queries.sql
-- Description: Demonstrates SQL aggregation and analytical summary:
--              COUNT, SUM, AVG, MIN, MAX, GROUP BY, and HAVING.
-- ============================================================================

USE voltix_db;

-- ----------------------------------------------------------------------------
-- 1. COUNT, SUM, AVG, MIN, MAX:
-- Comprehensive charging session performance summary across the network.
-- ----------------------------------------------------------------------------
SELECT 
    COUNT(session_id) AS total_sessions_recorded,
    COALESCE(SUM(energy_consumed), 0) AS total_energy_dispensed_kwh,
    COALESCE(ROUND(AVG(energy_consumed), 2), 0) AS avg_energy_per_session_kwh,
    COALESCE(MIN(energy_consumed), 0) AS min_energy_kwh,
    COALESCE(MAX(energy_consumed), 0) AS max_energy_kwh,
    COALESCE(ROUND(AVG(duration_minutes), 1), 0) AS avg_duration_minutes,
    COALESCE(SUM(final_cost), 0) AS total_gross_billed_inr,
    COALESCE(ROUND(AVG(final_cost), 2), 0) AS avg_session_cost_inr
FROM charging_session
WHERE end_time IS NOT NULL;

-- ----------------------------------------------------------------------------
-- 2. GROUP BY:
-- Charging station hardware distribution, total bays, and maximum available power.
-- ----------------------------------------------------------------------------
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    COUNT(ch.charger_id) AS total_chargers_installed,
    SUM(ct.power_rating) AS total_grid_capacity_kw,
    MAX(ct.power_rating) AS peak_charger_output_kw,
    ROUND(AVG(ct.power_rating), 1) AS avg_charger_power_kw
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
JOIN charger ch ON s.station_id = ch.station_id
JOIN charger_type ct ON ch.charger_type_id = ct.charger_type_id
GROUP BY s.station_id, s.station_name, c.city_name
ORDER BY total_grid_capacity_kw DESC;

-- ----------------------------------------------------------------------------
-- 3. GROUP BY with HAVING:
-- Top-rated charging stations with an average rating >= 4.0 and at least 2 customer reviews.
-- ----------------------------------------------------------------------------
SELECT 
    s.station_id,
    s.station_name,
    c.city_name,
    COUNT(r.review_id) AS review_count,
    ROUND(AVG(r.rating), 2) AS avg_star_rating,
    MIN(r.rating) AS lowest_rating,
    MAX(r.rating) AS highest_rating
FROM charging_station s
JOIN city c ON s.city_id = c.city_id
JOIN review r ON s.station_id = r.station_id
GROUP BY s.station_id, s.station_name, c.city_name
HAVING COUNT(r.review_id) >= 2 
   AND AVG(r.rating) >= 4.00
ORDER BY avg_star_rating DESC, review_count DESC;

-- ----------------------------------------------------------------------------
-- 4. GROUP BY with HAVING (Customer Expenditure):
-- Identify high-value users whose total charging payments exceed ₹1,000.
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id,
    u.name AS customer_name,
    u.email,
    COUNT(p.payment_id) AS total_payments_made,
    SUM(p.amount) AS total_spent_inr,
    ROUND(AVG(p.amount), 2) AS avg_spend_per_session_inr
FROM `user` u
JOIN payment p ON u.user_id = p.user_id
WHERE p.payment_status = 'SUCCESS'
GROUP BY u.user_id, u.name, u.email
HAVING SUM(p.amount) > 1000.00
ORDER BY total_spent_inr DESC;

-- ----------------------------------------------------------------------------
-- 5. GROUP BY:
-- Regional network performance aggregated by metropolitan city.
-- ----------------------------------------------------------------------------
SELECT 
    c.city_name,
    c.state,
    COUNT(DISTINCT s.station_id) AS active_stations,
    COUNT(DISTINCT ch.charger_id) AS total_chargers,
    COUNT(DISTINCT cs.session_id) AS total_sessions_conducted,
    COALESCE(SUM(cs.energy_consumed), 0.00) AS total_energy_kwh,
    COALESCE(SUM(p.amount), 0.00) AS total_city_revenue_inr
FROM city c
LEFT JOIN charging_station s ON c.city_id = s.city_id
LEFT JOIN charger ch ON s.station_id = ch.station_id
LEFT JOIN charging_session cs ON ch.charger_id = cs.charger_id
LEFT JOIN payment p ON cs.session_id = p.session_id AND p.payment_status = 'SUCCESS'
GROUP BY c.city_id, c.city_name, c.state
ORDER BY total_city_revenue_inr DESC;

-- ----------------------------------------------------------------------------
-- 6. GROUP BY (Payment Channels):
-- Payment gateway channel volume, settlement count, and gross processed revenue.
-- ----------------------------------------------------------------------------
SELECT 
    payment_method,
    COUNT(payment_id) AS total_transactions,
    SUM(CASE WHEN payment_status = 'SUCCESS' THEN 1 ELSE 0 END) AS successful_transactions,
    SUM(CASE WHEN payment_status = 'FAILED' THEN 1 ELSE 0 END) AS failed_transactions,
    COALESCE(SUM(CASE WHEN payment_status = 'SUCCESS' THEN amount ELSE 0.00 END), 0.00) AS settled_volume_inr,
    ROUND(AVG(CASE WHEN payment_status = 'SUCCESS' THEN amount ELSE NULL END), 2) AS avg_ticket_size_inr
FROM payment
GROUP BY payment_method
ORDER BY settled_volume_inr DESC;

-- ----------------------------------------------------------------------------
-- 7. GROUP BY (Hardware Maintenance Audit):
-- Technician workload, completed repair tickets, and cumulative labor & parts costs.
-- ----------------------------------------------------------------------------
SELECT 
    u.user_id AS technician_id,
    u.name AS technician_name,
    COUNT(mrec.maintenance_id) AS jobs_completed,
    SUM(mrec.cost) AS total_repair_cost_inr,
    ROUND(AVG(mrec.cost), 2) AS avg_job_cost_inr,
    MAX(mrec.cost) AS highest_repair_cost_inr
FROM `user` u
JOIN maintenance_record mrec ON u.user_id = mrec.technician_id
GROUP BY u.user_id, u.name
ORDER BY total_repair_cost_inr DESC;
