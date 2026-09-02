-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: station_report.sql
-- Description: Stored Procedure generating an operational and financial report
--              for a charging station over a specified date range.
-- ============================================================================

USE voltix_db;

DROP PROCEDURE IF EXISTS station_report;

DELIMITER $$

CREATE PROCEDURE station_report(
    IN p_station_id INT,
    IN p_start_date DATE,
    IN p_end_date   DATE
)
BEGIN
    -- Section 1: Station Master Header
    SELECT 
        s.station_id,
        s.station_name,
        c.city_name,
        c.state,
        u.name AS operator_name,
        u.email AS operator_email,
        s.status AS station_status,
        COUNT(ch.charger_id) AS total_chargers,
        COALESCE(SUM(ct.power_rating), 0) AS total_installed_capacity_kw,
        get_station_occupancy(s.station_id) AS current_occupancy_percentage
    FROM charging_station s
    JOIN city c ON s.city_id = c.city_id
    JOIN `user` u ON s.operator_id = u.user_id
    LEFT JOIN charger ch ON s.station_id = ch.station_id
    LEFT JOIN charger_type ct ON ch.charger_type_id = ct.charger_type_id
    WHERE s.station_id = p_station_id
    GROUP BY s.station_id, s.station_name, c.city_name, c.state, u.name, u.email, s.status;

    -- Section 2: Financial and Energy Performance Metrics
    SELECT 
        COUNT(cs.session_id) AS total_sessions_completed,
        COALESCE(SUM(cs.energy_consumed), 0.00) AS total_energy_dispensed_kwh,
        COALESCE(SUM(p.amount), 0.00) AS total_revenue_inr,
        COALESCE(ROUND(AVG(cs.duration_minutes), 1), 0.0) AS avg_duration_minutes,
        COALESCE(ROUND(AVG(cs.final_cost), 2), 0.00) AS avg_cost_per_session_inr
    FROM charging_session cs
    JOIN charger ch ON cs.charger_id = ch.charger_id
    LEFT JOIN payment p ON cs.session_id = p.session_id AND p.payment_status = 'SUCCESS'
    WHERE ch.station_id = p_station_id
      AND DATE(cs.start_time) BETWEEN p_start_date AND p_end_date;

    -- Section 3: Hardware Health and Customer Feedback
    SELECT 
        (SELECT COUNT(*) 
         FROM maintenance_request mr
         JOIN charger ch ON mr.charger_id = ch.charger_id
         WHERE ch.station_id = p_station_id
           AND DATE(mr.created_at) BETWEEN p_start_date AND p_end_date) AS maintenance_tickets_raised,
        (SELECT COALESCE(SUM(mrec.cost), 0.00)
         FROM maintenance_record mrec
         JOIN maintenance_request mr ON mrec.request_id = mr.request_id
         JOIN charger ch ON mr.charger_id = ch.charger_id
         WHERE ch.station_id = p_station_id
           AND DATE(mrec.start_time) BETWEEN p_start_date AND p_end_date) AS total_maintenance_expenditure_inr,
        (SELECT COALESCE(ROUND(AVG(r.rating), 2), 0.00)
         FROM review r
         WHERE r.station_id = p_station_id) AS average_customer_rating,
        (SELECT COUNT(*) 
         FROM review r 
         WHERE r.station_id = p_station_id) AS total_reviews_received;
END$$

DELIMITER ;

SELECT 'Created procedure station_report successfully.' AS status;
