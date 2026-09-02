-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: 04_indexes.sql
-- Description: Creates B-Tree performance indexes for query optimization,
--              foreign key join acceleration, and temporal interval lookups.
-- Database: voltix_db
-- ============================================================================

USE voltix_db;

-- ----------------------------------------------------------------------------
-- 1. CHARGER Indexes
-- ----------------------------------------------------------------------------
-- Accelerates lookups of all chargers belonging to a given charging station.
CREATE INDEX idx_charger_station 
    ON charger (station_id);

-- Optimizes filtering of chargers by connector type and charging speed (e.g. CCS2, 50kW).
CREATE INDEX idx_charger_type 
    ON charger (charger_type_id);

-- Optimizes real-time status filtering (e.g. searching for AVAILABLE chargers in the UI).
CREATE INDEX idx_charger_status 
    ON charger (status);


-- ----------------------------------------------------------------------------
-- 2. RESERVATION Indexes
-- ----------------------------------------------------------------------------
-- Composite index for reservation overlap detection: checks if a charger is booked within [start_time, end_time].
CREATE INDEX idx_reservation_charger_time 
    ON reservation (charger_id, start_time, end_time);

-- Optimizes retrieval of booking history for a specific customer.
CREATE INDEX idx_reservation_user 
    ON reservation (user_id);

-- Speeds up status transitions and queries on active/pending bookings.
CREATE INDEX idx_reservation_status 
    ON reservation (status);


-- ----------------------------------------------------------------------------
-- 3. CHARGING_SESSION Indexes
-- ----------------------------------------------------------------------------
-- Speeds up queries fetching charging sessions for a specific EV vehicle.
CREATE INDEX idx_session_vehicle 
    ON charging_session (vehicle_id);

-- Optimizes session tracking and utilization calculations per physical charger.
CREATE INDEX idx_session_charger 
    ON charging_session (charger_id);

-- Accelerates date-range analytics (e.g., sessions per month, peak hour analytics).
CREATE INDEX idx_session_start_time 
    ON charging_session (start_time);


-- ----------------------------------------------------------------------------
-- 4. METER_READING Indexes
-- ----------------------------------------------------------------------------
-- Composite index for rapid chronological telemetry retrieval for an active session.
CREATE INDEX idx_reading_session_time 
    ON meter_reading (session_id, reading_time);


-- ----------------------------------------------------------------------------
-- 5. PAYMENT Indexes
-- ----------------------------------------------------------------------------
-- Accelerates billing history retrieval and customer invoice lookups.
CREATE INDEX idx_payment_user 
    ON payment (user_id);

-- Optimizes reconciliation queries filtering by payment outcome (PENDING, SUCCESS, FAILED).
CREATE INDEX idx_payment_status 
    ON payment (payment_status);


-- ----------------------------------------------------------------------------
-- 6. MAINTENANCE Indexes
-- ----------------------------------------------------------------------------
-- Accelerates retrieval of maintenance tickets for a specific charger (e.g. trigger checks).
CREATE INDEX idx_maint_request_charger 
    ON maintenance_request (charger_id);

-- Speeds up technician dispatch queries filtering for OPEN / IN_PROGRESS tickets.
CREATE INDEX idx_maint_request_status 
    ON maintenance_request (status);


-- ----------------------------------------------------------------------------
-- 7. REVIEW Indexes
-- ----------------------------------------------------------------------------
-- Speeds up aggregation of reviews and average star ratings for a charging station.
CREATE INDEX idx_review_station 
    ON review (station_id);


-- ----------------------------------------------------------------------------
-- 8. CHARGING_STATION & VEHICLE Indexes
-- ----------------------------------------------------------------------------
-- Speeds up station geo-filtering by city.
CREATE INDEX idx_station_city 
    ON charging_station (city_id);

-- Speeds up station filtering by assigned station operator.
CREATE INDEX idx_station_operator 
    ON charging_station (operator_id);

-- Accelerates vehicle lookups for a given user.
CREATE INDEX idx_vehicle_user 
    ON vehicle (user_id);

-- Speeds up transaction history queries per user wallet.
CREATE INDEX idx_wallet_tx_wallet 
    ON wallet_transaction (wallet_id, timestamp);

SELECT 'Successfully created all performance indexes.' AS status;
