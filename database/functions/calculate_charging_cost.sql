-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: calculate_charging_cost.sql
-- Description: Function to compute the final financial charge for a session.
-- Factors:
--   1. Actual energy consumed (kWh) from meter telemetry
--   2. Time-of-Use (ToU) tariff rates from pricing_rule (Peak vs Off-Peak)
--   3. Idle overstay penalty fees where applicable
--   4. Promotional discounts applied via user promotions
-- ============================================================================

USE voltix_db;

DROP FUNCTION IF EXISTS calculate_charging_cost;

DELIMITER $$

CREATE FUNCTION calculate_charging_cost(p_session_id INT)
RETURNS DECIMAL(10, 2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE v_energy DECIMAL(8, 2) DEFAULT 0.00;
    DECLARE v_duration INT DEFAULT 0;
    DECLARE v_start_time DATETIME;
    DECLARE v_time_only TIME;
    DECLARE v_day_name VARCHAR(10);
    DECLARE v_day_type VARCHAR(20);
    DECLARE v_rate_per_kwh DECIMAL(8, 2) DEFAULT 14.00;
    DECLARE v_idle_fee_rate DECIMAL(8, 2) DEFAULT 2.50;
    DECLARE v_idle_minutes INT DEFAULT 0;
    DECLARE v_idle_penalty DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_gross_cost DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_discount DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_final_cost DECIMAL(10, 2) DEFAULT 0.00;
    DECLARE v_user_id INT DEFAULT NULL;
    DECLARE v_promo_type VARCHAR(20) DEFAULT NULL;
    DECLARE v_promo_val DECIMAL(8, 2) DEFAULT 0.00;

    -- 1. Retrieve session metrics
    SELECT 
        s.energy_consumed,
        s.duration_minutes,
        s.start_time,
        v.user_id
    INTO 
        v_energy,
        v_duration,
        v_start_time,
        v_user_id
    FROM charging_session s
    JOIN vehicle v ON s.vehicle_id = v.vehicle_id
    WHERE s.session_id = p_session_id;

    -- If session does not exist, return 0.00
    IF v_start_time IS NULL THEN
        RETURN 0.00;
    END IF;

    -- Fallback: If energy_consumed is 0, attempt to calculate from meter readings
    IF v_energy <= 0.00 THEN
        SELECT COALESCE(MAX(energy_kwh) - MIN(energy_kwh), 0.00)
        INTO v_energy
        FROM meter_reading
        WHERE session_id = p_session_id;
    END IF;

    -- 2. Determine Day Type (WEEKDAY vs WEEKEND)
    SET v_time_only = CAST(v_start_time AS TIME);
    SET v_day_name = DAYNAME(v_start_time);
    
    IF v_day_name IN ('Saturday', 'Sunday') THEN
        SET v_day_type = 'WEEKEND';
    ELSE
        SET v_day_type = 'WEEKDAY';
    END IF;

    -- 3. Lookup applicable dynamic tariff from pricing_rule
    SELECT 
        r.price_per_kwh,
        r.idle_fee
    INTO 
        v_rate_per_kwh,
        v_idle_fee_rate
    FROM pricing_rule r
    WHERE (r.day_type = v_day_type OR r.day_type = 'ALL')
      AND v_time_only >= r.start_time
      AND v_time_only < r.end_time
    ORDER BY (r.day_type != 'ALL') DESC
    LIMIT 1;

    -- Default fallback if no specific interval matched in pricing_rule
    IF v_rate_per_kwh IS NULL THEN
        -- Standard default ₹14.00/kWh; Peak hours (09:00-12:00, 18:00-22:00) @ 1.25x (₹17.50/kWh)
        IF (v_time_only BETWEEN '09:00:00' AND '12:00:00') OR (v_time_only BETWEEN '18:00:00' AND '22:00:00') THEN
            SET v_rate_per_kwh = 17.50;
        ELSEIF (v_time_only BETWEEN '23:00:00' AND '23:59:59') OR (v_time_only BETWEEN '00:00:00' AND '06:00:00') THEN
            SET v_rate_per_kwh = 10.50;
        ELSE
            SET v_rate_per_kwh = 14.00;
        END IF;
    END IF;

    -- 4. Calculate Energy Cost
    SET v_gross_cost = v_energy * v_rate_per_kwh;

    -- 5. Calculate Idle Penalty (applied if session duration exceeds 90 minutes)
    IF v_duration > 90 AND v_idle_fee_rate > 0.00 THEN
        SET v_idle_minutes = v_duration - 90;
        SET v_idle_penalty = v_idle_minutes * (v_idle_fee_rate / 60.0);
    END IF;

    SET v_gross_cost = v_gross_cost + v_idle_penalty;

    -- 6. Apply Active Promotion Discount (if user redeemed an eligible coupon)
    SELECT 
        p.discount_type,
        p.discount_value
    INTO 
        v_promo_type,
        v_promo_val
    FROM user_promotion up
    JOIN promotion p ON up.promotion_id = p.promotion_id
    WHERE up.user_id = v_user_id
      AND DATE(v_start_time) BETWEEN p.start_date AND p.end_date
    ORDER BY up.used_at DESC
    LIMIT 1;

    IF v_promo_type = 'PERCENTAGE' THEN
        SET v_discount = (v_gross_cost * v_promo_val) / 100.00;
    ELSEIF v_promo_type = 'FIXED' THEN
        SET v_discount = v_promo_val;
    END IF;

    SET v_final_cost = v_gross_cost - v_discount;

    -- Enforce non-negative boundary constraint
    IF v_final_cost < 0.00 THEN
        SET v_final_cost = 0.00;
    END IF;

    RETURN ROUND(v_final_cost, 2);
END$$

DELIMITER ;

SELECT 'Created function calculate_charging_cost successfully.' AS status;
