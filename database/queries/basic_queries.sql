-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: basic_queries.sql
-- Description: Demonstrates fundamental SQL querying concepts:
--              SELECT, WHERE, ORDER BY, BETWEEN, LIKE, IN, and LIMIT.
-- ============================================================================

USE voltix_db;

-- ----------------------------------------------------------------------------
-- 1. SELECT, WHERE, ORDER BY:
-- Retrieve all active registered users sorted alphabetically by name.
-- ----------------------------------------------------------------------------
SELECT 
    user_id,
    name,
    email,
    phone,
    role,
    status,
    created_at
FROM `user`
WHERE status = 'ACTIVE'
ORDER BY name ASC;

-- ----------------------------------------------------------------------------
-- 2. WHERE with Comparison Operators & ORDER BY DESC:
-- Find all high-power DC fast charger hardware with rating >= 50 kW.
-- ----------------------------------------------------------------------------
SELECT 
    charger_id,
    station_id,
    charger_number,
    charger_type_id,
    status
FROM charger
WHERE status != 'OFFLINE'
ORDER BY charger_id ASC;

-- ----------------------------------------------------------------------------
-- 3. IN Operator:
-- Find all charging stations located in premier tech hub cities (Chennai, Bengaluru, Hyderabad).
-- ----------------------------------------------------------------------------
SELECT 
    station_id,
    station_name,
    city_id,
    address,
    status
FROM charging_station
WHERE city_id IN (1, 2, 4)
ORDER BY station_name ASC;

-- ----------------------------------------------------------------------------
-- 4. LIKE Operator (Pattern Matching):
-- Search for system users registered with official company domain (@voltix.in).
-- ----------------------------------------------------------------------------
SELECT 
    user_id,
    name,
    email,
    role
FROM `user`
WHERE email LIKE '%@voltix.in'
ORDER BY user_id ASC;

-- ----------------------------------------------------------------------------
-- 5. BETWEEN Operator (Date-Time Range):
-- Retrieve all charging sessions that were initiated during the first week of February 2026.
-- ----------------------------------------------------------------------------
SELECT 
    session_id,
    charger_id,
    vehicle_id,
    start_time,
    end_time,
    energy_consumed,
    duration_minutes,
    final_cost
FROM charging_session
WHERE start_time BETWEEN '2026-02-01 00:00:00' AND '2026-02-07 23:59:59'
ORDER BY start_time ASC;

-- ----------------------------------------------------------------------------
-- 6. BETWEEN Operator (Numerical Range) & ORDER BY:
-- List all EV models with battery capacity between 35 kWh and 75 kWh, sorted by power descending.
-- ----------------------------------------------------------------------------
SELECT 
    model_id,
    manufacturer,
    model_name,
    battery_capacity,
    max_charging_power
FROM vehicle_model
WHERE battery_capacity BETWEEN 35.00 AND 75.00
ORDER BY max_charging_power DESC;

-- ----------------------------------------------------------------------------
-- 7. IN Operator & Multiple Filter Predicates:
-- Filter urgent maintenance requests requiring immediate technician dispatch.
-- ----------------------------------------------------------------------------
SELECT 
    request_id,
    charger_id,
    issue_type,
    priority,
    status,
    created_at
FROM maintenance_request
WHERE priority IN ('HIGH', 'CRITICAL')
  AND status IN ('OPEN', 'IN_PROGRESS')
ORDER BY priority DESC, created_at ASC;

-- ----------------------------------------------------------------------------
-- 8. BETWEEN & Logical Conjunction:
-- Identify user digital wallets holding a healthy prepaid balance between ₹1,000 and ₹3,000.
-- ----------------------------------------------------------------------------
SELECT 
    wallet_id,
    user_id,
    balance,
    updated_at
FROM wallet
WHERE balance BETWEEN 1000.00 AND 3000.00
ORDER BY balance DESC;

-- ----------------------------------------------------------------------------
-- 9. LIKE Operator (Wildcard prefix & suffix):
-- Find all vehicles bearing registration numbers registered in Tamil Nadu (TN).
-- ----------------------------------------------------------------------------
SELECT 
    vehicle_id,
    user_id,
    model_id,
    registration_number,
    battery_percentage
FROM vehicle
WHERE registration_number LIKE 'TN-%'
ORDER BY registration_number ASC;

-- ----------------------------------------------------------------------------
-- 10. Complex WHERE with AND / OR & LIMIT:
-- Top 5 most expensive charging sessions that consumed over 30 kWh of energy.
-- ----------------------------------------------------------------------------
SELECT 
    session_id,
    charger_id,
    energy_consumed,
    duration_minutes,
    final_cost
FROM charging_session
WHERE energy_consumed >= 30.00 
  AND final_cost > 400.00
ORDER BY final_cost DESC
LIMIT 5;
