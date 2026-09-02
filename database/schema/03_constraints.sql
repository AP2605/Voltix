-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: 03_constraints.sql
-- Description: Defines Foreign Keys, Unique Keys, and Check Constraints.
-- Database: voltix_db
-- ============================================================================

USE voltix_db;

-- ============================================================================
-- 1. UNIQUE CONSTRAINTS
-- ============================================================================

-- USER: Ensure emails and phone numbers are strictly unique across the system
ALTER TABLE `user`
    ADD CONSTRAINT uq_user_email UNIQUE (email),
    ADD CONSTRAINT uq_user_phone UNIQUE (phone);

-- CITY: Prevent duplicate city-state combinations
ALTER TABLE city
    ADD CONSTRAINT uq_city_state UNIQUE (city_name, state);

-- VEHICLE_MODEL: Prevent redundant model definitions for the same OEM
ALTER TABLE vehicle_model
    ADD CONSTRAINT uq_model_manufacturer_name UNIQUE (manufacturer, model_name);

-- CHARGER_TYPE: Unique combination of connector and power rating
ALTER TABLE charger_type
    ADD CONSTRAINT uq_charger_type_connector_power UNIQUE (connector_type, power_rating);

-- PRICING_PLAN: Plan names must be distinct
ALTER TABLE pricing_plan
    ADD CONSTRAINT uq_pricing_plan_name UNIQUE (plan_name);

-- PROMOTION: Coupon codes must be unique for lookup
ALTER TABLE promotion
    ADD CONSTRAINT uq_promotion_code UNIQUE (code);

-- VEHICLE: Government registration plate must be unique nationwide
ALTER TABLE vehicle
    ADD CONSTRAINT uq_vehicle_registration UNIQUE (registration_number);

-- CHARGER: Charger number must be unique within its parent station
ALTER TABLE charger
    ADD CONSTRAINT uq_charger_station_number UNIQUE (station_id, charger_number);

-- CHARGING_SESSION: 1:1 Relationship with reservation (each reservation can have at most one session)
ALTER TABLE charging_session
    ADD CONSTRAINT uq_session_reservation UNIQUE (reservation_id);

-- PAYMENT: 1:1 Relationship with charging session (one financial settlement per session)
ALTER TABLE payment
    ADD CONSTRAINT uq_payment_session UNIQUE (session_id);

-- WALLET: 1:1 Relationship with user (each user has exactly one digital wallet)
ALTER TABLE wallet
    ADD CONSTRAINT uq_wallet_user UNIQUE (user_id);

-- REVIEW: A user can write at most one review per station (prevents review spamming)
ALTER TABLE review
    ADD CONSTRAINT uq_review_user_station UNIQUE (user_id, station_id);


-- ============================================================================
-- 2. CHECK CONSTRAINTS (Domain & Business Integrity)
-- ============================================================================

-- USER: Allowed role enumeration and account status
ALTER TABLE `user`
    ADD CONSTRAINT chk_user_role CHECK (role IN ('USER', 'OPERATOR', 'TECHNICIAN', 'ADMIN')),
    ADD CONSTRAINT chk_user_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED'));

-- VEHICLE_MODEL: Capacities and charging power ratings must be strictly positive
ALTER TABLE vehicle_model
    ADD CONSTRAINT chk_model_battery_capacity CHECK (battery_capacity > 0),
    ADD CONSTRAINT chk_model_max_charging_power CHECK (max_charging_power > 0);

-- CHARGER_TYPE: Output power must be strictly positive
ALTER TABLE charger_type
    ADD CONSTRAINT chk_charger_type_power CHECK (power_rating > 0);

-- PROMOTION: Discount values non-negative, valid date interval, non-negative usage limits
ALTER TABLE promotion
    ADD CONSTRAINT chk_promotion_discount_type CHECK (discount_type IN ('PERCENTAGE', 'FIXED')),
    ADD CONSTRAINT chk_promotion_discount_value CHECK (discount_value >= 0),
    ADD CONSTRAINT chk_promotion_dates CHECK (start_date <= end_date),
    ADD CONSTRAINT chk_promotion_usage_limit CHECK (usage_limit >= 0);

-- VEHICLE: Battery State-of-Charge percentage must be between 0% and 100%
ALTER TABLE vehicle
    ADD CONSTRAINT chk_vehicle_battery_percentage CHECK (battery_percentage BETWEEN 0.00 AND 100.00);

-- CHARGING_STATION: Geographic coordinate ranges and lifecycle status
ALTER TABLE charging_station
    ADD CONSTRAINT chk_station_latitude CHECK (latitude BETWEEN -90.0000000 AND 90.0000000),
    ADD CONSTRAINT chk_station_longitude CHECK (longitude BETWEEN -180.0000000 AND 180.0000000),
    ADD CONSTRAINT chk_station_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE'));

-- CHARGER: Valid operational states
ALTER TABLE charger
    ADD CONSTRAINT chk_charger_status CHECK (status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'OFFLINE'));

-- RESERVATION: Start time must precede end time, valid status enumeration
ALTER TABLE reservation
    ADD CONSTRAINT chk_reservation_time_interval CHECK (start_time < end_time),
    ADD CONSTRAINT chk_reservation_status CHECK (status IN ('PENDING', 'CONFIRMED', 'ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED'));

-- CHARGING_SESSION: Non-negative metrics
ALTER TABLE charging_session
    ADD CONSTRAINT chk_session_energy CHECK (energy_consumed >= 0.00),
    ADD CONSTRAINT chk_session_duration CHECK (duration_minutes >= 0),
    ADD CONSTRAINT chk_session_cost CHECK (final_cost >= 0.00);

-- METER_READING: Telemetry parameters must be non-negative
ALTER TABLE meter_reading
    ADD CONSTRAINT chk_reading_voltage CHECK (voltage >= 0.00),
    ADD CONSTRAINT chk_reading_current CHECK (current >= 0.00),
    ADD CONSTRAINT chk_reading_energy CHECK (energy_kwh >= 0.00);

-- PRICING_RULE: Day type and tariff rates must be non-negative
ALTER TABLE pricing_rule
    ADD CONSTRAINT chk_rule_day_type CHECK (day_type IN ('WEEKDAY', 'WEEKEND', 'ALL')),
    ADD CONSTRAINT chk_rule_price_kwh CHECK (price_per_kwh >= 0.00),
    ADD CONSTRAINT chk_rule_idle_fee CHECK (idle_fee >= 0.00);

-- PAYMENT: Positive financial amount, valid methods and statuses
ALTER TABLE payment
    ADD CONSTRAINT chk_payment_amount CHECK (amount >= 0.00),
    ADD CONSTRAINT chk_payment_method CHECK (payment_method IN ('WALLET', 'UPI', 'CARD')),
    ADD CONSTRAINT chk_payment_status CHECK (payment_status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'));

-- WALLET: Wallet balance can never go below zero (prevents overdraft)
ALTER TABLE wallet
    ADD CONSTRAINT chk_wallet_balance CHECK (balance >= 0.00);

-- WALLET_TRANSACTION: Transfer amounts must be strictly positive, valid transaction categories
ALTER TABLE wallet_transaction
    ADD CONSTRAINT chk_wallet_tx_amount CHECK (amount > 0.00),
    ADD CONSTRAINT chk_wallet_tx_type CHECK (transaction_type IN ('CREDIT', 'DEBIT', 'REFUND'));

-- MAINTENANCE_REQUEST: Priority tiers and workflow statuses
ALTER TABLE maintenance_request
    ADD CONSTRAINT chk_maint_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    ADD CONSTRAINT chk_maint_status CHECK (status IN ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'));

-- MAINTENANCE_RECORD: Labor & material cost non-negative
ALTER TABLE maintenance_record
    ADD CONSTRAINT chk_maint_record_cost CHECK (cost >= 0.00);

-- REVIEW: Star ratings restricted between 1 and 5 stars
ALTER TABLE review
    ADD CONSTRAINT chk_review_rating CHECK (rating BETWEEN 1 AND 5);


-- ============================================================================
-- 3. FOREIGN KEY CONSTRAINTS (Referential Integrity)
-- ============================================================================

-- Note on Referential Policies:
-- ON DELETE RESTRICT is applied to audit/history/transaction entities to prevent
-- accidental cascade loss of financial and operational history.
-- ON DELETE CASCADE is applied strictly to tight child relationships (e.g. telemetry readings).

-- VEHICLE -> USER (RESTRICT: Retain user vehicle records, prevent deleting user with active vehicles)
-- VEHICLE -> VEHICLE_MODEL (RESTRICT: Model cannot be deleted if vehicles reference it)
ALTER TABLE vehicle
    ADD CONSTRAINT fk_vehicle_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_vehicle_model FOREIGN KEY (model_id) REFERENCES vehicle_model (model_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- CHARGING_STATION -> CITY (RESTRICT: City cannot be dropped while stations exist in it)
-- CHARGING_STATION -> USER (Operator) (RESTRICT: Operator cannot be dropped without reassignment)
ALTER TABLE charging_station
    ADD CONSTRAINT fk_station_city FOREIGN KEY (city_id) REFERENCES city (city_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_station_operator FOREIGN KEY (operator_id) REFERENCES `user` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- CHARGER -> CHARGING_STATION (CASCADE: Decommissioning station removes child chargers)
-- CHARGER -> CHARGER_TYPE (RESTRICT: Hardware specification cannot be deleted if chargers use it)
ALTER TABLE charger
    ADD CONSTRAINT fk_charger_station FOREIGN KEY (station_id) REFERENCES charging_station (station_id)
        ON DELETE CASCADE ON UPDATE CASCADE,
    ADD CONSTRAINT fk_charger_type FOREIGN KEY (charger_type_id) REFERENCES charger_type (charger_type_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- RESERVATION -> USER, VEHICLE, CHARGER (RESTRICT: Historical bookings must never be orphaned)
ALTER TABLE reservation
    ADD CONSTRAINT fk_reservation_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_reservation_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle (vehicle_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_reservation_charger FOREIGN KEY (charger_id) REFERENCES charger (charger_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- CHARGING_SESSION -> RESERVATION (RESTRICT: Cannot delete reservation if session occurred)
-- CHARGING_SESSION -> CHARGER, VEHICLE (RESTRICT: Critical audit history preservation)
ALTER TABLE charging_session
    ADD CONSTRAINT fk_session_reservation FOREIGN KEY (reservation_id) REFERENCES reservation (reservation_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_session_charger FOREIGN KEY (charger_id) REFERENCES charger (charger_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_session_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle (vehicle_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- METER_READING -> CHARGING_SESSION (CASCADE: Telemetry readings belong strictly to parent session)
ALTER TABLE meter_reading
    ADD CONSTRAINT fk_reading_session FOREIGN KEY (session_id) REFERENCES charging_session (session_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- PRICING_RULE -> PRICING_PLAN (CASCADE: Deleting a plan deletes its constituent rules)
ALTER TABLE pricing_rule
    ADD CONSTRAINT fk_pricing_rule_plan FOREIGN KEY (plan_id) REFERENCES pricing_plan (plan_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- PAYMENT -> CHARGING_SESSION, USER (RESTRICT: Financial accounting history must be preserved)
ALTER TABLE payment
    ADD CONSTRAINT fk_payment_session FOREIGN KEY (session_id) REFERENCES charging_session (session_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_payment_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- WALLET -> USER (RESTRICT: Financial ledger tied to user account)
ALTER TABLE wallet
    ADD CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- WALLET_TRANSACTION -> WALLET (RESTRICT: Transaction audit logs must never be purged)
ALTER TABLE wallet_transaction
    ADD CONSTRAINT fk_wallet_tx_wallet FOREIGN KEY (wallet_id) REFERENCES wallet (wallet_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- MAINTENANCE_REQUEST -> CHARGER (RESTRICT), TECHNICIAN (SET NULL: If tech profile removed, ticket remains)
ALTER TABLE maintenance_request
    ADD CONSTRAINT fk_maint_request_charger FOREIGN KEY (charger_id) REFERENCES charger (charger_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_maint_request_tech FOREIGN KEY (technician_id) REFERENCES `user` (user_id)
        ON DELETE SET NULL ON UPDATE CASCADE;

-- MAINTENANCE_RECORD -> MAINTENANCE_REQUEST, TECHNICIAN (RESTRICT: Audit work logs)
ALTER TABLE maintenance_record
    ADD CONSTRAINT fk_maint_record_request FOREIGN KEY (request_id) REFERENCES maintenance_request (request_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_maint_record_tech FOREIGN KEY (technician_id) REFERENCES `user` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

-- REVIEW -> USER (RESTRICT), CHARGING_STATION (CASCADE: Station deletion cascades reviews)
ALTER TABLE review
    ADD CONSTRAINT fk_review_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_review_station FOREIGN KEY (station_id) REFERENCES charging_station (station_id)
        ON DELETE CASCADE ON UPDATE CASCADE;

-- USER_PROMOTION -> USER, PROMOTION (RESTRICT: Promotion redemption history)
ALTER TABLE user_promotion
    ADD CONSTRAINT fk_user_promo_user FOREIGN KEY (user_id) REFERENCES `user` (user_id)
        ON DELETE RESTRICT ON UPDATE CASCADE,
    ADD CONSTRAINT fk_user_promo_promotion FOREIGN KEY (promotion_id) REFERENCES promotion (promotion_id)
        ON DELETE RESTRICT ON UPDATE CASCADE;

SELECT 'Successfully applied all Foreign Keys, Unique Keys, and Check Constraints.' AS status;
