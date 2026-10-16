-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: 02_tables.sql
-- Description: Creates all 20 relational tables in dependency order.
-- Engine: InnoDB (supports ACID, Foreign Keys, Transactions)
-- Charset: utf8mb4
-- ============================================================================

USE voltix_db;

-- Temporarily disable foreign key checks to allow safe clean recreation
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS user_promotion;
DROP TABLE IF EXISTS review;
DROP TABLE IF EXISTS maintenance_record;
DROP TABLE IF EXISTS maintenance_request;
DROP TABLE IF EXISTS wallet_transaction;
DROP TABLE IF EXISTS wallet;
DROP TABLE IF EXISTS payment;
DROP TABLE IF EXISTS pricing_rule;
DROP TABLE IF EXISTS meter_reading;
DROP TABLE IF EXISTS charging_session;
DROP TABLE IF EXISTS reservation;
DROP TABLE IF EXISTS charger;
DROP TABLE IF EXISTS charging_station;
DROP TABLE IF EXISTS vehicle;
DROP TABLE IF EXISTS promotion;
DROP TABLE IF EXISTS pricing_plan;
DROP TABLE IF EXISTS charger_type;
DROP TABLE IF EXISTS vehicle_model;
DROP TABLE IF EXISTS city;
DROP TABLE IF EXISTS `user`;

SET FOREIGN_KEY_CHECKS = 1;

-- ----------------------------------------------------------------------------
-- 1. USER
-- Stores account credentials, contact info, system role, and lifecycle status.
-- ----------------------------------------------------------------------------
CREATE TABLE `user` (
    user_id INT AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user PRIMARY KEY (user_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 2. CITY
-- Master directory of metropolitan cities and states where stations operate.
-- ----------------------------------------------------------------------------
CREATE TABLE city (
    city_id INT AUTO_INCREMENT,
    city_name VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    CONSTRAINT pk_city PRIMARY KEY (city_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 3. VEHICLE_MODEL
-- Reference specifications for electric vehicles (battery pack & max charging rate).
-- ----------------------------------------------------------------------------
CREATE TABLE vehicle_model (
    model_id INT AUTO_INCREMENT,
    manufacturer VARCHAR(100) NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    battery_capacity DECIMAL(6, 2) NOT NULL COMMENT 'Capacity in kilowatt-hours (kWh)',
    max_charging_power DECIMAL(6, 2) NOT NULL COMMENT 'Max input charging rate in kilowatts (kW)',
    CONSTRAINT pk_vehicle_model PRIMARY KEY (model_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 4. CHARGER_TYPE
-- Hardware specifications for connectors (e.g. CCS2, CHAdeMO, Type 2, GB/T).
-- ----------------------------------------------------------------------------
CREATE TABLE charger_type (
    charger_type_id INT AUTO_INCREMENT,
    connector_type VARCHAR(50) NOT NULL,
    power_rating DECIMAL(6, 2) NOT NULL COMMENT 'Rated power output in kilowatts (kW)',
    CONSTRAINT pk_charger_type PRIMARY KEY (charger_type_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 5. PRICING_PLAN
-- Tariff categories applicable across stations (STANDARD, PEAK, OFF_PEAK, PREMIUM).
-- ----------------------------------------------------------------------------
CREATE TABLE pricing_plan (
    plan_id INT AUTO_INCREMENT,
    plan_name VARCHAR(50) NOT NULL,
    CONSTRAINT pk_pricing_plan PRIMARY KEY (plan_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 6. PROMOTION
-- Marketing discounts, promotional coupons, and validity terms.
-- ----------------------------------------------------------------------------
CREATE TABLE promotion (
    promotion_id INT AUTO_INCREMENT,
    code VARCHAR(50) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(8, 2) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    usage_limit INT NOT NULL DEFAULT 100,
    CONSTRAINT pk_promotion PRIMARY KEY (promotion_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 7. VEHICLE
-- Specific vehicle units registered by users.
-- ----------------------------------------------------------------------------
CREATE TABLE vehicle (
    vehicle_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    model_id INT NOT NULL,
    registration_number VARCHAR(30) NOT NULL,
    battery_percentage DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT pk_vehicle PRIMARY KEY (vehicle_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 8. CHARGING_STATION
-- Physical charging station hubs deployed across cities, assigned to operators.
-- ----------------------------------------------------------------------------
CREATE TABLE charging_station (
    station_id INT AUTO_INCREMENT,
    city_id INT NOT NULL,
    operator_id INT NOT NULL,
    station_name VARCHAR(150) NOT NULL,
    latitude DECIMAL(10, 7) NOT NULL,
    longitude DECIMAL(10, 7) NOT NULL,
    address VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT pk_charging_station PRIMARY KEY (station_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 9. CHARGER
-- Individual charging points/guns installed at a physical charging station.
-- ----------------------------------------------------------------------------
CREATE TABLE charger (
    charger_id INT AUTO_INCREMENT,
    station_id INT NOT NULL,
    charger_type_id INT NOT NULL,
    charger_number VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    CONSTRAINT pk_charger PRIMARY KEY (charger_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 10. RESERVATION
-- Planned charging slots booked by EV users for specific chargers.
-- ----------------------------------------------------------------------------
CREATE TABLE reservation (
    reservation_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    charger_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_reservation PRIMARY KEY (reservation_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 11. CHARGING_SESSION
-- Actual physical charging execution, duration, energy consumed, and final cost.
-- ----------------------------------------------------------------------------
CREATE TABLE charging_session (
    session_id INT AUTO_INCREMENT,
    reservation_id INT NULL,
    charger_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    start_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME NULL,
    energy_consumed DECIMAL(8, 2) NOT NULL DEFAULT 0.00 COMMENT 'Consumed kWh',
    duration_minutes INT NOT NULL DEFAULT 0,
    final_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'Cost in INR',
    CONSTRAINT pk_charging_session PRIMARY KEY (session_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 12. METER_READING
-- Telemetry readings captured periodically during active charging sessions.
-- ----------------------------------------------------------------------------
CREATE TABLE meter_reading (
    reading_id INT AUTO_INCREMENT,
    session_id INT NOT NULL,
    reading_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    voltage DECIMAL(6, 2) NOT NULL COMMENT 'Grid / bus voltage in Volts',
    current DECIMAL(6, 2) NOT NULL COMMENT 'Charging current in Amperes',
    energy_kwh DECIMAL(8, 2) NOT NULL COMMENT 'Cumulative energy reading at this timestamp',
    CONSTRAINT pk_meter_reading PRIMARY KEY (reading_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 13. PRICING_RULE
-- Time-of-day and day-type tariff rates per pricing plan.
-- ----------------------------------------------------------------------------
CREATE TABLE pricing_rule (
    rule_id INT AUTO_INCREMENT,
    plan_id INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    day_type VARCHAR(20) NOT NULL DEFAULT 'ALL',
    price_per_kwh DECIMAL(8, 2) NOT NULL,
    idle_fee DECIMAL(8, 2) NOT NULL DEFAULT 0.00 COMMENT 'Fee per minute when connected without charging',
    CONSTRAINT pk_pricing_rule PRIMARY KEY (rule_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 14. PAYMENT
-- Financial settlement record for completed charging sessions.
-- ----------------------------------------------------------------------------
CREATE TABLE payment (
    payment_id INT AUTO_INCREMENT,
    session_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    payment_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    payment_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_payment PRIMARY KEY (payment_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 15. WALLET
-- Prepaid customer balance ledger (1:1 with USER).
-- ----------------------------------------------------------------------------
CREATE TABLE wallet (
    wallet_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    balance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_wallet PRIMARY KEY (wallet_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 16. WALLET_TRANSACTION
-- Audit trail of all balance adjustments (Credits, Debits, Refunds).
-- ----------------------------------------------------------------------------
CREATE TABLE wallet_transaction (
    transaction_id INT AUTO_INCREMENT,
    wallet_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_wallet_transaction PRIMARY KEY (transaction_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 17. MAINTENANCE_REQUEST
-- Incident reports and scheduled service tickets for hardware chargers.
-- ----------------------------------------------------------------------------
CREATE TABLE maintenance_request (
    request_id INT AUTO_INCREMENT,
    charger_id INT NOT NULL,
    technician_id INT NULL,
    issue_type VARCHAR(100) NOT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_maintenance_request PRIMARY KEY (request_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 18. MAINTENANCE_RECORD
-- Resolution logs, technician labor, parts cost, and work descriptions.
-- ----------------------------------------------------------------------------
CREATE TABLE maintenance_record (
    maintenance_id INT AUTO_INCREMENT,
    request_id INT NOT NULL,
    technician_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    description TEXT NOT NULL,
    CONSTRAINT pk_maintenance_record PRIMARY KEY (maintenance_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 19. REVIEW
-- User feedback, station ratings (1-5 stars), and written remarks.
-- ----------------------------------------------------------------------------
CREATE TABLE review (
    review_id INT AUTO_INCREMENT,
    user_id INT NOT NULL,
    station_id INT NOT NULL,
    rating INT NOT NULL,
    comment TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_review PRIMARY KEY (review_id)
) ENGINE = InnoDB;

-- ----------------------------------------------------------------------------
-- 20. USER_PROMOTION
-- Associative table tracking user redemptions of promotional coupons (N:M).
-- ----------------------------------------------------------------------------
CREATE TABLE user_promotion (
    user_id INT NOT NULL,
    promotion_id INT NOT NULL,
    used_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_user_promotion PRIMARY KEY (user_id, promotion_id)
) ENGINE = InnoDB;

SELECT 'Successfully created all 20 base tables for VOLTIX.' AS status;
