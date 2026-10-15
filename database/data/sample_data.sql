-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: sample_data.sql
-- Description: Realistic, comprehensive dataset for Voltix EV Network.
-- Features:
--   - 18 Users (Users, Operators, Technicians, Admin)
--   - 6 Indian Metros & Towns
--   - 10 EV Models (Cars & 2-Wheelers)
--   - 5 Connector Types (AC & High-Power DC)
--   - 12 Charging Stations with distinct utilization profiles
--   - 36 Physical Chargers across various operational states
--   - 36 Reservations (Completed, Active, Confirmed, Cancelled, Expired)
--   - 30 Charging Sessions (Completed & Active)
--   - 120+ Meter Telemetry Readings
--   - 4 Pricing Plans & 12 Time-of-Use Dynamic Pricing Rules
--   - 30 Payment Records (Wallet, UPI, Card)
--   - 12 Wallets & 36 Wallet Ledger Transactions
--   - 20 Maintenance Incident Requests & 14 Resolved Maintenance Records
--   - 24 Station Reviews (1 to 5 Stars)
--   - 6 Promotional Campaigns & 14 User Redemptions
-- ============================================================================

USE voltix_db;

-- Temporarily disable foreign keys for clean idempotent data refresh
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE user_promotion;
TRUNCATE TABLE review;
TRUNCATE TABLE maintenance_record;
TRUNCATE TABLE maintenance_request;
TRUNCATE TABLE wallet_transaction;
TRUNCATE TABLE wallet;
TRUNCATE TABLE payment;
TRUNCATE TABLE pricing_rule;
TRUNCATE TABLE meter_reading;
TRUNCATE TABLE charging_session;
TRUNCATE TABLE reservation;
TRUNCATE TABLE charger;
TRUNCATE TABLE charging_station;
TRUNCATE TABLE vehicle;
TRUNCATE TABLE promotion;
TRUNCATE TABLE pricing_plan;
TRUNCATE TABLE charger_type;
TRUNCATE TABLE vehicle_model;
TRUNCATE TABLE city;
TRUNCATE TABLE `user`;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- 1. USER (18 Users: 1 Admin, 3 Operators, 2 Technicians, 12 Consumers)
-- ============================================================================
INSERT INTO `user` (user_id, name, email, phone, password_hash, role, status, created_at) VALUES
(1,  'Ayush Sharma',     'ayush.admin@voltix.in',    '+91-9876543201', '$2a$12$e8Y/dGkX3vL1b.VOLTIXADMINHASH01', 'ADMIN',      'ACTIVE',    '2026-01-01 08:00:00'),
(2,  'Rajesh Kumar',     'rajesh.operator@voltix.in', '+91-9876543202', '$2a$12$e8Y/dGkX3vL1b.VOLTIXOPERATOR01', 'OPERATOR',   'ACTIVE',    '2026-01-05 09:30:00'),
(3,  'Suresh Patel',     'suresh.operator@voltix.in', '+91-9876543203', '$2a$12$e8Y/dGkX3vL1b.VOLTIXOPERATOR02', 'OPERATOR',   'ACTIVE',    '2026-01-08 10:15:00'),
(4,  'Ananya Iyer',      'ananya.operator@voltix.in', '+91-9876543204', '$2a$12$e8Y/dGkX3vL1b.VOLTIXOPERATOR03', 'OPERATOR',   'ACTIVE',    '2026-01-10 11:00:00'),
(5,  'Vikram Singh',     'vikram.tech@voltix.in',     '+91-9876543205', '$2a$12$e8Y/dGkX3vL1b.VOLTIXTECH01001', 'TECHNICIAN', 'ACTIVE',    '2026-01-12 14:00:00'),
(6,  'Karthik Raja',     'karthik.tech@voltix.in',    '+91-9876543206', '$2a$12$e8Y/dGkX3vL1b.VOLTIXTECH02002', 'TECHNICIAN', 'ACTIVE',    '2026-01-15 15:45:00'),
(7,  'Rahul Verma',      'rahul.verma@gmail.com',     '+91-9811122334', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER01001', 'USER',       'ACTIVE',    '2026-01-18 10:00:00'),
(8,  'Priya Sundaram',   'priya.sundaram@yahoo.com',  '+91-9822233445', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER02002', 'USER',       'ACTIVE',    '2026-01-20 12:30:00'),
(9,  'Amit Joshi',       'amit.joshi@outlook.com',    '+91-9833344556', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER03003', 'USER',       'ACTIVE',    '2026-01-22 09:15:00'),
(10, 'Sneha Reddy',      'sneha.reddy@gmail.com',     '+91-9844455667', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER04004', 'USER',       'ACTIVE',    '2026-01-25 16:20:00'),
(11, 'Rohan Das',        'rohan.das@hotmail.com',     '+91-9855566778', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER05005', 'USER',       'ACTIVE',    '2026-02-01 11:10:00'),
(12, 'Divya Nair',       'divya.nair@gmail.com',      '+91-9866677889', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER06006', 'USER',       'ACTIVE',    '2026-02-03 14:40:00'),
(13, 'Manoj Pillai',     'manoj.pillai@gmail.com',    '+91-9877788990', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER07007', 'USER',       'ACTIVE',    '2026-02-05 18:00:00'),
(14, 'Neha Gupta',       'neha.gupta@rediffmail.com', '+91-9888899001', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER08008', 'USER',       'ACTIVE',    '2026-02-08 08:30:00'),
(15, 'Sanjay Hegde',     'sanjay.hegde@gmail.com',    '+91-9899900112', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER09009', 'USER',       'ACTIVE',    '2026-02-10 13:25:00'),
(16, 'Pooja Deshmukh',   'pooja.deshmukh@gmail.com',  '+91-9800011223', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER10010', 'USER',       'ACTIVE',    '2026-02-12 17:50:00'),
(17, 'Arvind Swamy',     'arvind.swamy@zoho.com',     '+91-9810123456', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER11011', 'USER',       'INACTIVE',  '2026-02-15 19:10:00'),
(18, 'Kavita Krishnan',  'kavita.k@gmail.com',        '+91-9821234567', '$2a$12$e8Y/dGkX3vL1b.VOLTIXUSER12012', 'USER',       'SUSPENDED', '2026-02-18 10:05:00');

-- ============================================================================
-- 2. CITY (6 Key Hubs)
-- ============================================================================
INSERT INTO city (city_id, city_name, state) VALUES
(1, 'Chennai',    'Tamil Nadu'),
(2, 'Bengaluru',  'Karnataka'),
(3, 'Vellore',    'Tamil Nadu'),
(4, 'Hyderabad',  'Telangana'),
(5, 'Coimbatore', 'Tamil Nadu'),
(6, 'Pune',       'Maharashtra');

-- ============================================================================
-- 3. VEHICLE_MODEL (10 Popular Indian Models)
-- ============================================================================
INSERT INTO vehicle_model (model_id, manufacturer, model_name, battery_capacity, max_charging_power) VALUES
(1,  'Tata Motors',  'Nexon EV Max',       40.50,  50.00),
(2,  'Tata Motors',  'Punch EV',           35.00,  30.00),
(3,  'MG Motor',     'ZS EV',              50.30,  50.00),
(4,  'Mahindra',     'XUV400 EV',          39.40,  50.00),
(5,  'Hyundai',      'Ioniq 5',            72.60, 150.00),
(6,  'BYD',          'Atto 3',             60.48,  80.00),
(7,  'Kia',          'EV6',                77.40, 240.00),
(8,  'Ola Electric', 'S1 Pro Gen 2',        4.00,   3.30),
(9,  'Ather Energy', '450X Gen 3',          3.70,   3.00),
(10, 'TVS Motor',    'iQube Electric',      3.04,   2.50);

-- ============================================================================
-- 4. CHARGER_TYPE (5 Hardware Standards)
-- ============================================================================
INSERT INTO charger_type (charger_type_id, connector_type, power_rating) VALUES
(1, 'CCS2',    50.00),   -- DC Fast Charger
(2, 'CCS2',   120.00),   -- DC Ultra-Fast Highway Charger
(3, 'CHAdeMO', 50.00),   -- DC Rapid Legacy Japanese Standard
(4, 'TYPE2',   22.00),   -- AC Three-Phase Fast Destination Charger
(5, 'GB/T',    15.00);   -- DC Light Electric Vehicle Standard

-- ============================================================================
-- 5. PRICING_PLAN (4 Plans)
-- ============================================================================
INSERT INTO pricing_plan (plan_id, plan_name) VALUES
(1, 'STANDARD'),
(2, 'PEAK'),
(3, 'OFF_PEAK'),
(4, 'PREMIUM');

-- ============================================================================
-- 6. PRICING_RULE (12 Dynamic Tariff Rules)
-- ============================================================================
INSERT INTO pricing_rule (rule_id, plan_id, start_time, end_time, day_type, price_per_kwh, idle_fee) VALUES
(1,  1, '00:00:00', '23:59:59', 'ALL',     14.00, 2.00),
(2,  2, '09:00:00', '12:00:00', 'WEEKDAY', 18.50, 4.00),
(3,  2, '18:00:00', '22:00:00', 'WEEKDAY', 19.50, 5.00),
(4,  2, '10:00:00', '14:00:00', 'WEEKEND', 16.50, 3.00),
(5,  3, '23:00:00', '23:59:59', 'ALL',     10.50, 1.00),
(6,  3, '00:00:00', '06:00:00', 'ALL',     10.50, 1.00),
(7,  3, '12:00:00', '16:00:00', 'WEEKEND', 12.00, 1.50),
(8,  4, '00:00:00', '23:59:59', 'ALL',     22.00, 0.00),
(9,  1, '06:00:00', '09:00:00', 'WEEKDAY', 13.50, 2.00),
(10, 1, '12:00:00', '18:00:00', 'WEEKDAY', 14.50, 2.50),
(11, 2, '17:00:00', '21:00:00', 'WEEKEND', 17.50, 3.50),
(12, 3, '13:00:00', '17:00:00', 'WEEKDAY', 11.50, 1.00);

-- ============================================================================
-- 7. PROMOTION (6 Discount Campaigns)
-- ============================================================================
INSERT INTO promotion (promotion_id, code, discount_type, discount_value, start_date, end_date, usage_limit) VALUES
(1, 'VOLTIXNEW',   'PERCENTAGE', 20.00, '2026-01-01', '2026-12-31', 1000),
(2, 'PEAKSAVER',   'FIXED',     100.00, '2026-01-01', '2026-06-30',  500),
(3, 'GREENEV',     'PERCENTAGE', 15.00, '2026-02-01', '2026-12-31',  800),
(4, 'MONSOON50',   'FIXED',      50.00, '2026-06-01', '2026-09-30',  300),
(5, 'MEGACHARGE',  'PERCENTAGE', 25.00, '2026-08-01', '2026-10-31',  250),
(6, 'DIWALI2026',  'FIXED',     150.00, '2026-10-15', '2026-11-15',  500);

-- ============================================================================
-- 8. VEHICLE (20 Registered Vehicles)
-- ============================================================================
INSERT INTO vehicle (vehicle_id, user_id, model_id, registration_number, battery_percentage) VALUES
(1,   7, 1, 'TN-01-EV-1001', 82.00),
(2,   7, 8, 'TN-01-EV-1002', 45.00), -- User 7 owns two vehicles
(3,   8, 3, 'TN-07-EV-2001', 60.00),
(4,   9, 2, 'KA-01-EV-3001', 75.00),
(5,  10, 5, 'TS-09-EV-4001', 90.00),
(6,  10, 9, 'TS-09-EV-4002', 30.00), -- User 10 owns two vehicles
(7,  11, 4, 'MH-12-EV-5001', 55.00),
(8,  12, 1, 'KA-05-EV-6001', 68.00),
(9,  13, 6, 'TN-23-EV-7001', 40.00),
(10, 14, 2, 'TN-38-EV-8001', 88.00),
(11, 15, 7, 'KA-51-EV-9001', 95.00),
(12, 16, 3, 'MH-14-EV-1101', 50.00),
(13, 17, 10, 'TN-02-EV-1201', 25.00),
(14, 18, 4, 'KA-03-EV-1301', 70.00),
(15,  7, 5, 'TN-01-EV-1003', 92.00), -- User 7 luxury long-range vehicle
(16,  8, 8, 'TN-07-EV-2002', 80.00),
(17,  9, 1, 'KA-01-EV-3002', 62.00),
(18, 11, 6, 'MH-12-EV-5002', 85.00),
(19, 12, 9, 'KA-05-EV-6002', 40.00),
(20, 14, 4, 'TN-38-EV-8002', 77.00);

-- ============================================================================
-- 9. CHARGING_STATION (12 Physical Station Hubs across 6 Cities)
-- ============================================================================
INSERT INTO charging_station (station_id, city_id, operator_id, station_name, latitude, longitude, address, status) VALUES
(1,  1, 2, 'Voltix Superhub OMR',         12.9715987, 80.2437829, 'Plot 12, Rajiv Gandhi Salai, Thoraipakkam, Chennai',      'ACTIVE'),
(2,  1, 2, 'Anna Nagar EV Plaza',         13.0850392, 80.2101372, '2nd Avenue, Anna Nagar Roundtana, Chennai',              'ACTIVE'),
(3,  1, 2, 'Guindy Industrial FastCharge', 13.0066721, 80.2025372, 'CIPET Road, Guindy Industrial Estate, Chennai',         'ACTIVE'),
(4,  2, 3, 'Indiranagar VoltStation',     12.9783692, 77.6408356, '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',  'ACTIVE'),
(5,  2, 3, 'Electronic City Hub',         12.8452145, 77.6601684, 'Phase 1, Hosur Road, Electronic City, Bengaluru',        'ACTIVE'),
(6,  2, 3, 'Whitefield Tech ChargeBay',   12.9698123, 77.7499482, 'ITPL Main Road, Whitefield, Bengaluru',                  'ACTIVE'),
(7,  3, 4, 'VIT Campus VoltPoint',        12.9692471, 79.1559384, 'Near Main Gate, VIT University, Katpadi, Vellore',       'ACTIVE'),
(8,  3, 4, 'Katpadi Junction FastCharge', 12.9798541, 79.1362145, 'Station Road, Opp Railway Station, Katpadi, Vellore',    'ACTIVE'),
(9,  4, 2, 'Hitec City UltraCharger',     17.4435123, 78.3772341, 'Cyber Towers Quad, Madhapur, Hitec City, Hyderabad',     'ACTIVE'),
(10, 4, 2, 'Gachibowli GreenHub',         17.4400812, 78.3489145, 'Financial District, Nanakramguda, Gachibowli, Hyderabad','ACTIVE'),
(11, 5, 4, 'RS Puram EV Station',         11.0125412, 76.9452145, 'DB Road, RS Puram, Coimbatore',                         'ACTIVE'),
(12, 6, 3, 'Hinjewadi Infotech ChargePark', 18.5912781, 73.7389145, 'Phase 1, Rajiv Gandhi Infotech Park, Hinjewadi, Pune', 'ACTIVE');

-- ============================================================================
-- 10. CHARGER (36 Physical Units - Diverse Statuses and Speeds)
-- ============================================================================
INSERT INTO charger (charger_id, station_id, charger_type_id, charger_number, status) VALUES
-- Station 1: Voltix Superhub OMR (Chennai) - 4 chargers
(1,  1, 2, 'OMR-CH01', 'AVAILABLE'),
(2,  1, 1, 'OMR-CH02', 'OCCUPIED'),
(3,  1, 4, 'OMR-CH03', 'AVAILABLE'),
(4,  1, 5, 'OMR-CH04', 'AVAILABLE'),

-- Station 2: Anna Nagar EV Plaza (Chennai) - 3 chargers
(5,  2, 1, 'AN-CH01',  'MAINTENANCE'), -- Under maintenance to demonstrate trigger/views
(6,  2, 1, 'AN-CH02',  'AVAILABLE'),
(7,  2, 4, 'AN-CH03',  'RESERVED'),

-- Station 3: Guindy Industrial FastCharge (Chennai) - 3 chargers
(8,  3, 2, 'GD-CH01',  'AVAILABLE'),
(9,  3, 1, 'GD-CH02',  'AVAILABLE'),
(10, 3, 3, 'GD-CH03',  'OFFLINE'),

-- Station 4: Indiranagar VoltStation (Bengaluru) - 3 chargers
(11, 4, 2, 'IN-CH01',  'OCCUPIED'),
(12, 4, 1, 'IN-CH02',  'AVAILABLE'),
(13, 4, 4, 'IN-CH03',  'AVAILABLE'),

-- Station 5: Electronic City Hub (Bengaluru) - 4 chargers
(14, 5, 2, 'EC-CH01',  'OCCUPIED'),
(15, 5, 2, 'EC-CH02',  'AVAILABLE'),
(16, 5, 1, 'EC-CH03',  'RESERVED'),
(17, 5, 4, 'EC-CH04',  'AVAILABLE'),

-- Station 6: Whitefield Tech ChargeBay (Bengaluru) - 3 chargers
(18, 6, 1, 'WF-CH01',  'MAINTENANCE'),
(19, 6, 4, 'WF-CH02',  'AVAILABLE'),
(20, 6, 5, 'WF-CH03',  'AVAILABLE'),

-- Station 7: VIT Campus VoltPoint (Vellore) - 3 chargers
(21, 7, 1, 'VIT-CH01', 'OCCUPIED'),
(22, 7, 4, 'VIT-CH02', 'AVAILABLE'),
(23, 7, 5, 'VIT-CH03', 'AVAILABLE'),

-- Station 8: Katpadi Junction FastCharge (Vellore) - 2 chargers
(24, 8, 1, 'KAT-CH01', 'AVAILABLE'),
(25, 8, 4, 'KAT-CH02', 'RESERVED'),

-- Station 9: Hitec City UltraCharger (Hyderabad) - 3 chargers
(26, 9, 2, 'HC-CH01',  'AVAILABLE'),
(27, 9, 2, 'HC-CH02',  'OCCUPIED'),
(28, 9, 1, 'HC-CH03',  'AVAILABLE'),

-- Station 10: Gachibowli GreenHub (Hyderabad) - 3 chargers
(29, 10, 1, 'GB-CH01', 'AVAILABLE'),
(30, 10, 4, 'GB-CH02', 'AVAILABLE'),
(31, 10, 3, 'GB-CH03', 'OFFLINE'),

-- Station 11: RS Puram EV Station (Coimbatore) - 2 chargers
(32, 11, 1, 'RS-CH01', 'AVAILABLE'),
(33, 11, 4, 'RS-CH02', 'AVAILABLE'),

-- Station 12: Hinjewadi Infotech ChargePark (Pune) - 3 chargers
(34, 12, 2, 'HJ-CH01', 'OCCUPIED'),
(35, 12, 1, 'HJ-CH02', 'RESERVED'),
(36, 12, 4, 'HJ-CH03', 'OFFLINE');

-- ============================================================================
-- 11. RESERVATION (36 Reservations: Completed, Active, Confirmed, Cancelled, Expired)
-- ============================================================================
INSERT INTO reservation (reservation_id, user_id, vehicle_id, charger_id, start_time, end_time, status, created_at) VALUES
-- Past Completed Reservations (1 to 24)
(1,   7,  1,  1, '2026-02-01 09:00:00', '2026-02-01 10:00:00', 'COMPLETED', '2026-02-01 08:30:00'),
(2,   8,  3,  2, '2026-02-01 11:00:00', '2026-02-01 12:15:00', 'COMPLETED', '2026-02-01 10:40:00'),
(3,   9,  4,  8, '2026-02-02 14:00:00', '2026-02-02 15:00:00', 'COMPLETED', '2026-02-02 13:15:00'),
(4,  10,  5, 11, '2026-02-03 10:30:00', '2026-02-03 11:45:00', 'COMPLETED', '2026-02-03 09:50:00'),
(5,  11,  7, 14, '2026-02-04 16:00:00', '2026-02-04 17:10:00', 'COMPLETED', '2026-02-04 15:20:00'),
(6,  12,  8, 15, '2026-02-05 08:00:00', '2026-02-05 09:00:00', 'COMPLETED', '2026-02-05 07:30:00'),
(7,  13,  9, 21, '2026-02-06 18:30:00', '2026-02-06 19:40:00', 'COMPLETED', '2026-02-06 18:00:00'),
(8,  14, 10, 24, '2026-02-07 11:00:00', '2026-02-07 12:00:00', 'COMPLETED', '2026-02-07 10:10:00'),
(9,  15, 11, 26, '2026-02-08 13:00:00', '2026-02-08 14:15:00', 'COMPLETED', '2026-02-08 12:20:00'),
(10, 16, 12, 34, '2026-02-09 15:00:00', '2026-02-09 16:00:00', 'COMPLETED', '2026-02-09 14:05:00'),
(11,  7, 15,  1, '2026-02-10 10:00:00', '2026-02-10 11:30:00', 'COMPLETED', '2026-02-10 09:15:00'),
(12,  8, 16,  4, '2026-02-11 12:00:00', '2026-02-11 13:00:00', 'COMPLETED', '2026-02-11 11:30:00'),
(13,  9, 17, 12, '2026-02-12 17:00:00', '2026-02-12 18:15:00', 'COMPLETED', '2026-02-12 16:25:00'),
(14, 10,  6, 28, '2026-02-13 09:30:00', '2026-02-13 10:30:00', 'COMPLETED', '2026-02-13 08:50:00'),
(15, 11, 18, 34, '2026-02-14 14:00:00', '2026-02-14 15:30:00', 'COMPLETED', '2026-02-14 13:10:00'),
(16, 12, 19, 13, '2026-02-15 11:00:00', '2026-02-15 12:10:00', 'COMPLETED', '2026-02-15 10:35:00'),
(17, 13,  9, 22, '2026-02-16 16:00:00', '2026-02-16 17:00:00', 'COMPLETED', '2026-02-16 15:15:00'),
(18, 14, 20, 32, '2026-02-17 10:00:00', '2026-02-17 11:15:00', 'COMPLETED', '2026-02-17 09:20:00'),
(19, 15, 11, 27, '2026-02-18 19:00:00', '2026-02-18 20:30:00', 'COMPLETED', '2026-02-18 18:10:00'),
(20,  7,  1,  3, '2026-02-19 14:00:00', '2026-02-19 15:00:00', 'COMPLETED', '2026-02-19 13:20:00'),
(21,  8,  3,  6, '2026-02-20 11:30:00', '2026-02-20 12:45:00', 'COMPLETED', '2026-02-20 10:45:00'),
(22, 10,  5,  9, '2026-02-21 16:30:00', '2026-02-21 17:45:00', 'COMPLETED', '2026-02-21 15:50:00'),
(23, 12,  8, 17, '2026-02-22 13:00:00', '2026-02-22 14:15:00', 'COMPLETED', '2026-02-22 12:15:00'),
(24, 16, 12, 29, '2026-02-23 18:00:00', '2026-02-23 19:10:00', 'COMPLETED', '2026-02-23 17:25:00'),

-- Currently Active Charging Reservations (Linked to OCCUPIED chargers)
(25,  7,  1,  2, DATE_SUB(NOW(), INTERVAL 35 MINUTE), DATE_ADD(NOW(), INTERVAL 25 MINUTE), 'ACTIVE', DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
(26,  9,  4, 11, DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_ADD(NOW(), INTERVAL 15 MINUTE), 'ACTIVE', DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
(27, 11,  7, 14, DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_ADD(NOW(), INTERVAL 40 MINUTE), 'ACTIVE', DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
(28, 13,  9, 21, DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_ADD(NOW(), INTERVAL 10 MINUTE), 'ACTIVE', DATE_SUB(NOW(), INTERVAL 70 MINUTE)),

-- Confirmed Upcoming Reservations (Linked to RESERVED chargers)
(29,  8,  3,  7, DATE_ADD(NOW(), INTERVAL 10 MINUTE), DATE_ADD(NOW(), INTERVAL 70 MINUTE), 'CONFIRMED', NOW()),
(30, 10,  5, 16, DATE_ADD(NOW(), INTERVAL 15 MINUTE), DATE_ADD(NOW(), INTERVAL 75 MINUTE), 'CONFIRMED', NOW()),
(31, 14, 10, 25, DATE_ADD(NOW(), INTERVAL 5 MINUTE),  DATE_ADD(NOW(), INTERVAL 65 MINUTE), 'CONFIRMED', NOW()),
(32, 16, 12, 35, DATE_ADD(NOW(), INTERVAL 12 MINUTE), DATE_ADD(NOW(), INTERVAL 72 MINUTE), 'CONFIRMED', NOW()),

-- Cancelled & Expired Bookings
(33, 12,  8,  1, '2026-02-15 09:00:00', '2026-02-15 10:00:00', 'CANCELLED', '2026-02-15 08:00:00'),
(34, 15, 11,  8, '2026-02-16 14:00:00', '2026-02-16 15:00:00', 'CANCELLED', '2026-02-16 13:00:00'),
(35,  7,  2, 15, '2026-02-18 10:00:00', '2026-02-18 11:00:00', 'EXPIRED',   '2026-02-18 09:00:00'),
(36, 10,  6, 26, '2026-02-20 15:00:00', '2026-02-20 16:00:00', 'EXPIRED',   '2026-02-20 14:00:00');

-- ============================================================================
-- 12. CHARGING_SESSION (30 Sessions: 26 Completed + 4 Ongoing Active)
-- ============================================================================
INSERT INTO charging_session (session_id, reservation_id, charger_id, vehicle_id, start_time, end_time, energy_consumed, duration_minutes, final_cost) VALUES
-- Past 24 Completed Sessions
(1,   1,  1,  1, '2026-02-01 09:05:00', '2026-02-01 09:55:00', 32.50, 50, 455.00),
(2,   2,  2,  3, '2026-02-01 11:03:00', '2026-02-01 12:10:00', 41.20, 67, 576.80),
(3,   3,  8,  4, '2026-02-02 14:02:00', '2026-02-02 14:52:00', 28.00, 50, 392.00),
(4,   4, 11,  5, '2026-02-03 10:32:00', '2026-02-03 11:40:00', 52.40, 68, 733.60),
(5,   5, 14,  7, '2026-02-04 16:05:00', '2026-02-04 17:05:00', 31.80, 60, 445.20),
(6,   6, 15,  8, '2026-02-05 08:02:00', '2026-02-05 08:58:00', 30.10, 56, 421.40),
(7,   7, 21,  9, '2026-02-06 18:35:00', '2026-02-06 19:35:00', 44.00, 60, 616.00),
(8,   8, 24, 10, '2026-02-07 11:04:00', '2026-02-07 11:54:00', 24.50, 50, 343.00),
(9,   9, 26, 11, '2026-02-08 13:02:00', '2026-02-08 14:10:00', 58.00, 68, 812.00),
(10, 10, 34, 12, '2026-02-09 15:05:00', '2026-02-09 15:55:00', 36.20, 50, 506.80),
(11, 11,  1, 15, '2026-02-10 10:05:00', '2026-02-10 11:25:00', 62.00, 80, 868.00),
(12, 12,  4, 16, '2026-02-11 12:02:00', '2026-02-11 12:55:00',  3.20, 53,  44.80),
(13, 13, 12, 17, '2026-02-12 17:04:00', '2026-02-12 18:10:00', 33.50, 66, 469.00),
(14, 14, 28,  6, '2026-02-13 09:32:00', '2026-02-13 10:25:00',  2.80, 53,  39.20),
(15, 15, 34, 18, '2026-02-14 14:02:00', '2026-02-14 15:25:00', 48.60, 83, 680.40),
(16, 16, 13, 19, '2026-02-15 11:03:00', '2026-02-15 12:05:00',  2.50, 62,  35.00),
(17, 17, 22,  9, '2026-02-16 16:02:00', '2026-02-16 16:55:00', 16.00, 53, 224.00),
(18, 18, 32, 20, '2026-02-17 10:04:00', '2026-02-17 11:10:00', 29.50, 66, 413.00),
(19, 19, 27, 11, '2026-02-18 19:05:00', '2026-02-18 20:25:00', 64.00, 80, 896.00),
(20, 20,  3,  1, '2026-02-19 14:03:00', '2026-02-19 14:55:00', 15.50, 52, 217.00),
(21, 21,  6,  3, '2026-02-20 11:32:00', '2026-02-20 12:40:00', 35.00, 68, 490.00),
(22, 22,  9,  5, '2026-02-21 16:35:00', '2026-02-21 17:40:00', 45.00, 65, 630.00),
(23, 23, 17,  8, '2026-02-22 13:02:00', '2026-02-22 14:10:00', 16.50, 68, 231.00),
(24, 24, 29, 12, '2026-02-23 18:03:00', '2026-02-23 19:05:00', 34.00, 62, 476.00),

-- Additional completed walk-in / direct sessions
(25, NULL, 1,  1, '2026-02-25 09:00:00', '2026-02-25 09:45:00', 25.00, 45, 350.00),
(26, NULL, 4, 16, '2026-02-26 15:00:00', '2026-02-26 15:40:00',  2.90, 40,  40.60),

-- 4 Currently Active Charging Sessions (end_time NULL, final_cost 0.00)
(27, 25,  2,  1, DATE_SUB(NOW(), INTERVAL 35 MINUTE), NULL, 22.40, 35, 0.00),
(28, 26, 11,  4, DATE_SUB(NOW(), INTERVAL 45 MINUTE), NULL, 34.80, 45, 0.00),
(29, 27, 14,  7, DATE_SUB(NOW(), INTERVAL 20 MINUTE), NULL, 14.50, 20, 0.00),
(30, 28, 21,  9, DATE_SUB(NOW(), INTERVAL 50 MINUTE), NULL, 38.00, 50, 0.00);

-- ============================================================================
-- 13. METER_READING (120+ Telemetry Data Points)
-- ============================================================================
INSERT INTO meter_reading (reading_id, session_id, reading_time, voltage, current, energy_kwh) VALUES
-- Telemetry for Session 1 (OMR-CH01, 32.5 kWh)
(1,  1, '2026-02-01 09:05:00', 400.20, 110.50,  0.00),
(2,  1, '2026-02-01 09:15:00', 399.80, 112.00,  7.20),
(3,  1, '2026-02-01 09:25:00', 401.10, 111.40, 15.10),
(4,  1, '2026-02-01 09:35:00', 400.50, 108.00, 23.00),
(5,  1, '2026-02-01 09:45:00', 398.90,  95.00, 29.80),
(6,  1, '2026-02-01 09:55:00', 402.00,  45.00, 32.50),

-- Telemetry for Session 2 (OMR-CH02, 41.2 kWh)
(7,  2, '2026-02-01 11:03:00', 399.50, 105.00,  0.00),
(8,  2, '2026-02-01 11:20:00', 400.10, 106.20, 11.50),
(9,  2, '2026-02-01 11:40:00', 398.70, 104.80, 24.20),
(10, 2, '2026-02-01 12:00:00', 401.50,  88.00, 36.80),
(11, 2, '2026-02-01 12:10:00', 402.30,  35.00, 41.20),

-- Telemetry for Session 4 (Indiranagar, 52.4 kWh)
(12, 4, '2026-02-03 10:32:00', 410.20, 140.00,  0.00),
(13, 4, '2026-02-03 10:50:00', 408.90, 142.50, 16.20),
(14, 4, '2026-02-03 11:10:00', 409.50, 138.00, 34.00),
(15, 4, '2026-02-03 11:30:00', 411.00, 110.00, 48.50),
(16, 4, '2026-02-03 11:40:00', 412.50,  40.00, 52.40),

-- Telemetry for Session 9 (Hitec City, 58.0 kWh)
(17, 9, '2026-02-08 13:02:00', 415.00, 155.00,  0.00),
(18, 9, '2026-02-08 13:20:00', 414.20, 156.00, 18.50),
(19, 9, '2026-02-08 13:40:00', 413.80, 150.00, 37.00),
(20, 9, '2026-02-08 14:00:00', 416.10,  95.00, 52.20),
(21, 9, '2026-02-08 14:10:00', 417.00,  30.00, 58.00),

-- Telemetry for Session 11 (OMR Ultra-Fast, 62.0 kWh)
(22, 11, '2026-02-10 10:05:00', 412.00, 160.00,  0.00),
(23, 11, '2026-02-10 10:25:00', 410.50, 162.00, 19.50),
(24, 11, '2026-02-10 10:45:00', 411.80, 158.00, 39.00),
(25, 11, '2026-02-10 11:05:00', 413.40, 120.00, 54.50),
(26, 11, '2026-02-10 11:25:00', 415.00,  45.00, 62.00),

-- Telemetry for Session 19 (Hitec City, 64.0 kWh)
(27, 19, '2026-02-18 19:05:00', 410.00, 158.00,  0.00),
(28, 19, '2026-02-18 19:25:00', 409.20, 160.00, 20.00),
(29, 19, '2026-02-18 19:45:00', 408.50, 155.00, 40.50),
(30, 19, '2026-02-18 20:05:00', 411.20, 115.00, 57.00),
(31, 19, '2026-02-18 20:25:00', 412.80,  42.00, 64.00),

-- Telemetry for Ongoing Session 27 (OMR-CH02, 22.4 kWh so far)
(32, 27, DATE_SUB(NOW(), INTERVAL 35 MINUTE), 400.10, 108.00,  0.00),
(33, 27, DATE_SUB(NOW(), INTERVAL 25 MINUTE), 399.50, 109.50,  6.80),
(34, 27, DATE_SUB(NOW(), INTERVAL 15 MINUTE), 401.00, 108.20, 14.50),
(35, 27, DATE_SUB(NOW(), INTERVAL 5 MINUTE),  399.80, 107.00, 22.40),

-- Telemetry for Ongoing Session 28 (Indiranagar, 34.8 kWh so far)
(36, 28, DATE_SUB(NOW(), INTERVAL 45 MINUTE), 411.00, 145.00,  0.00),
(37, 28, DATE_SUB(NOW(), INTERVAL 30 MINUTE), 410.20, 146.20, 12.50),
(38, 28, DATE_SUB(NOW(), INTERVAL 15 MINUTE), 409.80, 144.00, 24.20),
(39, 28, DATE_SUB(NOW(), INTERVAL 2 MINUTE),  411.50, 130.00, 34.80),

-- Telemetry for Ongoing Session 29 (Electronic City, 14.5 kWh so far)
(40, 29, DATE_SUB(NOW(), INTERVAL 20 MINUTE), 402.50, 115.00,  0.00),
(41, 29, DATE_SUB(NOW(), INTERVAL 10 MINUTE), 401.80, 116.00,  7.20),
(42, 29, DATE_SUB(NOW(), INTERVAL 1 MINUTE),  403.00, 114.50, 14.50),

-- Telemetry for Ongoing Session 30 (VIT Vellore, 38.0 kWh so far)
(43, 30, DATE_SUB(NOW(), INTERVAL 50 MINUTE), 398.50, 112.00,  0.00),
(44, 30, DATE_SUB(NOW(), INTERVAL 35 MINUTE), 397.80, 113.20, 12.00),
(45, 30, DATE_SUB(NOW(), INTERVAL 20 MINUTE), 399.00, 111.50, 24.50),
(46, 30, DATE_SUB(NOW(), INTERVAL 5 MINUTE),  400.20, 105.00, 38.00);

-- Populate additional readings for other completed sessions to exceed 120 total readings
INSERT INTO meter_reading (reading_id, session_id, reading_time, voltage, current, energy_kwh) VALUES
(47,  3, '2026-02-02 14:02:00', 400.00, 100.00,  0.00),
(48,  3, '2026-02-02 14:20:00', 399.00, 101.00, 10.50),
(49,  3, '2026-02-02 14:40:00', 401.00,  99.00, 22.00),
(50,  3, '2026-02-02 14:52:00', 402.00,  50.00, 28.00),

(51,  5, '2026-02-04 16:05:00', 405.00, 110.00,  0.00),
(52,  5, '2026-02-04 16:25:00', 404.00, 111.00, 11.20),
(53,  5, '2026-02-04 16:45:00', 406.00, 108.00, 23.50),
(54,  5, '2026-02-04 17:05:00', 407.00,  55.00, 31.80),

(55,  6, '2026-02-05 08:02:00', 398.00, 102.00,  0.00),
(56,  6, '2026-02-05 08:25:00', 399.00, 103.00, 12.80),
(57,  6, '2026-02-05 08:45:00', 400.00, 100.00, 24.00),
(58,  6, '2026-02-05 08:58:00', 401.00,  48.00, 30.10),

(59,  7, '2026-02-06 18:35:00', 400.00, 105.00,  0.00),
(60,  7, '2026-02-06 18:55:00', 399.00, 106.00, 15.00),
(61,  7, '2026-02-06 19:15:00', 401.00, 104.00, 30.50),
(62,  7, '2026-02-06 19:35:00', 402.00,  60.00, 44.00),

(63,  8, '2026-02-07 11:04:00', 402.00,  95.00,  0.00),
(64,  8, '2026-02-07 11:24:00', 401.00,  96.00, 10.00),
(65,  8, '2026-02-07 11:44:00', 403.00,  94.00, 20.00),
(66,  8, '2026-02-07 11:54:00', 404.00,  40.00, 24.50),

(67, 10, '2026-02-09 15:05:00', 406.00, 115.00,  0.00),
(68, 10, '2026-02-09 15:25:00', 405.00, 116.00, 14.50),
(69, 10, '2026-02-09 15:45:00', 407.00, 112.00, 29.00),
(70, 10, '2026-02-09 15:55:00', 408.00,  50.00, 36.20),

(71, 13, '2026-02-12 17:04:00', 400.00, 108.00,  0.00),
(72, 13, '2026-02-12 17:25:00', 399.00, 109.00, 12.00),
(73, 13, '2026-02-12 17:50:00', 401.00, 106.00, 25.00),
(74, 13, '2026-02-12 18:10:00', 402.00,  45.00, 33.50),

(75, 15, '2026-02-14 14:02:00', 412.00, 140.00,  0.00),
(76, 15, '2026-02-14 14:30:00', 411.00, 142.00, 18.00),
(77, 15, '2026-02-14 15:00:00', 410.00, 138.00, 36.00),
(78, 15, '2026-02-14 15:25:00', 413.00,  60.00, 48.60),

(79, 17, '2026-02-16 16:02:00', 398.00,  85.00,  0.00),
(80, 17, '2026-02-16 16:25:00', 399.00,  86.00,  6.50),
(81, 17, '2026-02-16 16:45:00', 400.00,  84.00, 13.00),
(82, 17, '2026-02-16 16:55:00', 401.00,  40.00, 16.00),

(83, 18, '2026-02-17 10:04:00', 401.00, 104.00,  0.00),
(84, 18, '2026-02-17 10:25:00', 400.00, 105.00, 10.00),
(85, 18, '2026-02-17 10:50:00', 402.00, 102.00, 21.00),
(86, 18, '2026-02-17 11:10:00', 403.00,  42.00, 29.50),

(87, 20, '2026-02-19 14:03:00', 399.00,  90.00,  0.00),
(88, 20, '2026-02-19 14:25:00', 400.00,  91.00,  6.00),
(89, 20, '2026-02-19 14:45:00', 401.00,  88.00, 12.00),
(90, 20, '2026-02-19 14:55:00', 402.00,  35.00, 15.50),

(91, 21, '2026-02-20 11:32:00', 402.00, 110.00,  0.00),
(92, 21, '2026-02-20 11:55:00', 401.00, 111.00, 12.50),
(93, 21, '2026-02-20 12:20:00', 403.00, 108.00, 26.00),
(94, 21, '2026-02-20 12:40:00', 404.00,  50.00, 35.00),

(95, 22, '2026-02-21 16:35:00', 404.00, 125.00,  0.00),
(96, 22, '2026-02-21 17:00:00', 403.00, 126.00, 18.00),
(97, 22, '2026-02-21 17:25:00', 405.00, 122.00, 36.00),
(98, 22, '2026-02-21 17:40:00', 406.00,  55.00, 45.00),

(99,  23, '2026-02-22 13:02:00', 400.00,  88.00,  0.00),
(100, 23, '2026-02-22 13:25:00', 401.00,  89.00,  5.80),
(101, 23, '2026-02-22 13:50:00', 402.00,  86.00, 12.00),
(102, 23, '2026-02-22 14:10:00', 403.00,  38.00, 16.50),

(103, 24, '2026-02-23 18:03:00', 405.00, 114.00,  0.00),
(104, 24, '2026-02-23 18:25:00', 404.00, 115.00, 12.00),
(105, 24, '2026-02-23 18:50:00', 406.00, 112.00, 26.00),
(106, 24, '2026-02-23 19:05:00', 407.00,  48.00, 34.00),

(107, 25, '2026-02-25 09:00:00', 402.00, 105.00,  0.00),
(108, 25, '2026-02-25 09:20:00', 401.00, 106.00, 12.00),
(109, 25, '2026-02-25 09:45:00', 403.00,  50.00, 25.00),

(110, 26, '2026-02-26 15:00:00', 230.00,  16.00,  0.00),
(111, 26, '2026-02-26 15:20:00', 229.50,  16.10,  1.40),
(112, 26, '2026-02-26 15:40:00', 230.20,  15.80,  2.90),

(113, 12, '2026-02-11 12:02:00', 230.00,  15.50,  0.00),
(114, 12, '2026-02-11 12:30:00', 231.00,  15.80,  1.60),
(115, 12, '2026-02-11 12:55:00', 229.80,  15.20,  3.20),

(116, 14, '2026-02-13 09:32:00', 230.50,  15.00,  0.00),
(117, 14, '2026-02-13 10:00:00', 231.20,  15.20,  1.40),
(118, 14, '2026-02-13 10:25:00', 229.90,  14.80,  2.80),

(119, 16, '2026-02-15 11:03:00', 230.00,  14.50,  0.00),
(120, 16, '2026-02-15 11:35:00', 230.80,  14.60,  1.30),
(121, 16, '2026-02-15 12:05:00', 229.40,  14.20,  2.50);

-- ============================================================================
-- 14. PAYMENT (30 Payments: 26 Settled, 3 Failed, 1 Refunded)
-- ============================================================================
INSERT INTO payment (payment_id, session_id, user_id, amount, payment_method, payment_status, payment_time) VALUES
(1,   1,  7, 455.00, 'WALLET', 'SUCCESS', '2026-02-01 09:56:00'),
(2,   2,  8, 576.80, 'UPI',    'SUCCESS', '2026-02-01 12:12:00'),
(3,   3,  9, 392.00, 'CARD',   'SUCCESS', '2026-02-02 14:53:00'),
(4,   4, 10, 733.60, 'WALLET', 'SUCCESS', '2026-02-03 11:42:00'),
(5,   5, 11, 445.20, 'UPI',    'SUCCESS', '2026-02-04 17:07:00'),
(6,   6, 12, 421.40, 'WALLET', 'SUCCESS', '2026-02-05 09:00:00'),
(7,   7, 13, 616.00, 'CARD',   'SUCCESS', '2026-02-06 19:37:00'),
(8,   8, 14, 343.00, 'WALLET', 'SUCCESS', '2026-02-07 11:56:00'),
(9,   9, 15, 812.00, 'UPI',    'SUCCESS', '2026-02-08 14:12:00'),
(10, 10, 16, 506.80, 'WALLET', 'SUCCESS', '2026-02-09 15:57:00'),
(11, 11,  7, 868.00, 'WALLET', 'SUCCESS', '2026-02-10 11:27:00'),
(12, 12,  8,  44.80, 'UPI',    'SUCCESS', '2026-02-11 12:57:00'),
(13, 13,  9, 469.00, 'CARD',   'SUCCESS', '2026-02-12 18:12:00'),
(14, 14, 10,  39.20, 'WALLET', 'SUCCESS', '2026-02-13 10:27:00'),
(15, 15, 11, 680.40, 'WALLET', 'SUCCESS', '2026-02-14 15:27:00'),
(16, 16, 12,  35.00, 'UPI',    'SUCCESS', '2026-02-15 12:07:00'),
(17, 17, 13, 224.00, 'CARD',   'SUCCESS', '2026-02-16 16:57:00'),
(18, 18, 14, 413.00, 'WALLET', 'SUCCESS', '2026-02-17 11:12:00'),
(19, 19, 15, 896.00, 'UPI',    'SUCCESS', '2026-02-18 20:27:00'),
(20, 20,  7, 217.00, 'WALLET', 'SUCCESS', '2026-02-19 14:57:00'),
(21, 21,  8, 490.00, 'UPI',    'SUCCESS', '2026-02-20 12:42:00'),
(22, 22, 10, 630.00, 'CARD',   'SUCCESS', '2026-02-21 17:42:00'),
(23, 23, 12, 231.00, 'WALLET', 'SUCCESS', '2026-02-22 14:12:00'),
(24, 24, 16, 476.00, 'WALLET', 'SUCCESS', '2026-02-23 19:07:00'),
(25, 25,  7, 350.00, 'WALLET', 'SUCCESS', '2026-02-25 09:47:00'),
(26, 26,  8,  40.60, 'UPI',    'SUCCESS', '2026-02-26 15:42:00'),

-- Simulated Failed or In-Progress/Refunded Transactions for testing audit logic
(27, 27,  7, 313.60, 'WALLET', 'FAILED',   DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
(28, 28,  9, 487.20, 'CARD',   'FAILED',   DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
(29, 29, 11, 203.00, 'UPI',    'PENDING',  DATE_SUB(NOW(), INTERVAL 2 MINUTE)),
(30, 30, 13, 532.00, 'WALLET', 'REFUNDED', '2026-02-27 18:00:00');

-- ============================================================================
-- 15. WALLET (12 Consumer User Accounts)
-- ============================================================================
INSERT INTO wallet (wallet_id, user_id, balance, updated_at) VALUES
(1,   7, 2450.00, '2026-02-25 09:47:00'),
(2,   8, 1250.50, '2026-02-26 15:42:00'),
(3,   9,  680.00, '2026-02-12 18:12:00'),
(4,  10, 1890.00, '2026-02-21 17:42:00'),
(5,  11,  550.00, '2026-02-14 15:27:00'),
(6,  12, 1420.00, '2026-02-22 14:12:00'),
(7,  13, 3100.00, '2026-02-27 18:00:00'),
(8,  14,  780.00, '2026-02-17 11:12:00'),
(9,  15, 1150.00, '2026-02-18 20:27:00'),
(10, 16,  840.00, '2026-02-23 19:07:00'),
(11, 17,  250.00, '2026-02-15 19:10:00'),
(12, 18,  500.00, '2026-02-18 10:05:00');

-- ============================================================================
-- 16. WALLET_TRANSACTION (36 Audit Ledger Entries)
-- ============================================================================
INSERT INTO wallet_transaction (transaction_id, wallet_id, amount, transaction_type, timestamp) VALUES
-- Top-ups (Credits)
(1,   1, 3000.00, 'CREDIT', '2026-01-20 10:00:00'),
(2,   1, 1500.00, 'CREDIT', '2026-02-05 14:00:00'),
(3,   2, 2000.00, 'CREDIT', '2026-01-22 11:30:00'),
(4,   3, 1000.00, 'CREDIT', '2026-01-25 09:00:00'),
(5,   4, 2500.00, 'CREDIT', '2026-01-28 16:00:00'),
(6,   5, 1500.00, 'CREDIT', '2026-02-01 12:00:00'),
(7,   6, 2000.00, 'CREDIT', '2026-02-02 15:30:00'),
(8,   7, 3000.00, 'CREDIT', '2026-02-03 10:00:00'),
(9,   7,  532.00, 'REFUND', '2026-02-27 18:05:00'),
(10,  8, 1500.00, 'CREDIT', '2026-02-05 11:00:00'),
(11,  9, 2000.00, 'CREDIT', '2026-02-06 14:00:00'),
(12, 10, 1500.00, 'CREDIT', '2026-02-08 17:00:00'),
(13, 11,  500.00, 'CREDIT', '2026-02-10 12:00:00'),
(14, 12,  500.00, 'CREDIT', '2026-02-12 15:00:00'),

-- Session Debits
(15,  1,  455.00, 'DEBIT',  '2026-02-01 09:56:00'),
(16,  4,  733.60, 'DEBIT',  '2026-02-03 11:42:00'),
(17,  6,  421.40, 'DEBIT',  '2026-02-05 09:00:00'),
(18,  8,  343.00, 'DEBIT',  '2026-02-07 11:56:00'),
(19, 10,  506.80, 'DEBIT',  '2026-02-09 15:57:00'),
(20,  1,  868.00, 'DEBIT',  '2026-02-10 11:27:00'),
(21,  4,   39.20, 'DEBIT',  '2026-02-13 10:27:00'),
(22,  5,  680.40, 'DEBIT',  '2026-02-14 15:27:00'),
(23,  8,  413.00, 'DEBIT',  '2026-02-17 11:12:00'),
(24,  1,  217.00, 'DEBIT',  '2026-02-19 14:57:00'),
(25,  6,  231.00, 'DEBIT',  '2026-02-22 14:12:00'),
(26, 10,  476.00, 'DEBIT',  '2026-02-23 19:07:00'),
(27,  1,  350.00, 'DEBIT',  '2026-02-25 09:47:00'),
(28,  7,  532.00, 'DEBIT',  '2026-02-27 17:50:00'),

-- Additional top-ups & refunds for volume
(29,  1, 1000.00, 'CREDIT', '2026-02-20 18:00:00'),
(30,  2,  500.00, 'CREDIT', '2026-02-22 10:00:00'),
(31,  4, 1000.00, 'CREDIT', '2026-02-24 14:00:00'),
(32,  5,  500.00, 'CREDIT', '2026-02-25 11:00:00'),
(33,  6,  500.00, 'CREDIT', '2026-02-26 12:00:00'),
(34,  9,  500.00, 'CREDIT', '2026-02-26 16:00:00'),
(35, 10,  500.00, 'CREDIT', '2026-02-27 09:00:00'),
(36,  2,   50.00, 'REFUND', '2026-02-28 11:00:00');

-- ============================================================================
-- 17. MAINTENANCE_REQUEST (20 Service Tickets)
-- ============================================================================
INSERT INTO maintenance_request (request_id, charger_id, technician_id, issue_type, priority, status, created_at) VALUES
(1,   5, 5, 'Connector latch lock failure',       'HIGH',     'RESOLVED',    '2026-01-20 09:00:00'),
(2,   5, 5, 'Thermal throttle trigger trip',       'HIGH',     'RESOLVED',    '2026-02-02 11:30:00'),
(3,   5, 5, 'Ground fault isolation alarm',       'CRITICAL', 'OPEN',        '2026-02-25 14:00:00'), -- 3 tickets on Charger 5
(4,  10, 6, 'HMI touch screen unresponsive',      'MEDIUM',   'OPEN',        '2026-02-10 10:00:00'),
(5,  18, 5, 'AC contactor sticking',              'CRITICAL', 'IN_PROGRESS', '2026-02-18 16:30:00'),
(6,  18, 5, 'Cooling fan bearing wear noise',     'LOW',      'RESOLVED',    '2026-01-15 08:30:00'),
(7,  18, 6, 'RFID card tap reader failure',       'MEDIUM',   'RESOLVED',    '2026-02-05 13:15:00'), -- 3 tickets on Charger 18
(8,  31, 6, 'Power inverter IGBT module fault',   'CRITICAL', 'OPEN',        '2026-02-22 17:00:00'),
(9,  36, 6, 'Type 2 pilot communication timeout', 'HIGH',     'OPEN',        '2026-02-24 09:45:00'),
(10,  1, 5, 'Routine 6-month preventive health',  'LOW',      'RESOLVED',    '2026-01-10 10:00:00'),
(11,  2, 5, 'Cable retraction spring loose',      'LOW',      'RESOLVED',    '2026-01-12 11:30:00'),
(12,  8, 6, 'Emergency Stop button triggered',    'HIGH',     'RESOLVED',    '2026-01-25 15:00:00'),
(13, 11, 5, 'Firmware OTA update failure',        'MEDIUM',   'RESOLVED',    '2026-01-28 18:20:00'),
(14, 14, 6, 'LED status beacon ring burned out',  'LOW',      'RESOLVED',    '2026-02-01 14:10:00'),
(15, 21, 5, 'Overvoltage grid spike trip',        'HIGH',     'RESOLVED',    '2026-02-03 08:45:00'),
(16, 26, 6, 'Coolant level low sensor warning',   'MEDIUM',   'RESOLVED',    '2026-02-07 16:00:00'),
(17, 27, 5, 'Cable jacket surface abrasion',      'LOW',      'RESOLVED',    '2026-02-12 13:00:00'),
(18, 34, 6, 'Metering current sensor drift',      'HIGH',     'RESOLVED',    '2026-02-15 11:15:00'),
(19, 15, 5, 'Periodic calibration check',         'LOW',      'RESOLVED',    '2026-02-18 10:30:00'),
(20,  3, 6, 'Dust filter cleaning and air check', 'LOW',      'RESOLVED',    '2026-02-20 14:00:00');

-- ============================================================================
-- 18. MAINTENANCE_RECORD (14 Completed Repair Logs)
-- ============================================================================
INSERT INTO maintenance_record (maintenance_id, request_id, technician_id, start_time, end_time, cost, description) VALUES
(1,   1, 5, '2026-01-20 10:00:00', '2026-01-20 12:30:00', 3500.00, 'Replaced solenoid actuator on CCS2 connector handle. Retested mechanical interlock.'),
(2,   2, 5, '2026-02-02 12:00:00', '2026-02-02 14:00:00', 1800.00, 'Flushed cooling radiator fins, replaced heat sink paste, cleared thermal alarm.'),
(3,   6, 5, '2026-01-15 09:00:00', '2026-01-15 11:00:00', 1200.00, 'Installed new brushless DC 120mm exhaust fan. Operating sound verified within 45dB.'),
(4,   7, 6, '2026-02-05 14:00:00', '2026-02-05 15:30:00', 2400.00, 'Replaced ISO14443 RFID reader transceiver board. Verified NFC tap scanning.'),
(5,  10, 5, '2026-01-10 10:30:00', '2026-01-10 13:00:00', 1500.00, 'Completed insulation resistance test (Megger 1000V). Busbar torque inspection passed.'),
(6,  11, 5, '2026-01-12 12:00:00', '2026-01-12 13:00:00',  800.00, 'Tensioned counterbalance reel spring. Smooth return action confirmed.'),
(7,  12, 6, '2026-01-25 15:30:00', '2026-01-25 16:30:00',  500.00, 'Investigated false E-stop trip. Reset mushroom contact and tightened wiring terminals.'),
(8,  13, 5, '2026-01-28 19:00:00', '2026-01-28 20:30:00', 1200.00, 'Flashed firmware build v4.2.1 via USB debug interface. Restored OCPP connectivity.'),
(9,  14, 6, '2026-02-01 14:30:00', '2026-02-01 15:30:00',  950.00, 'Soldered replacement RGB LED ring on charging port halo. Tested light animations.'),
(10, 15, 5, '2026-02-03 09:30:00', '2026-02-03 11:30:00', 4500.00, 'Replaced primary surge protective device (Type 2 SPD cartridge) after grid overvoltage.'),
(11, 16, 6, '2026-02-07 16:30:00', '2026-02-07 18:00:00', 3200.00, 'Topped up dielectric coolant fluid (1.5L) and pressure-tested closed cooling loop.'),
(12, 17, 5, '2026-02-12 13:30:00', '2026-02-12 15:00:00', 1600.00, 'Inspected charging cable outer sheath. Applied vulcanized heat-shrink jacket repair.'),
(13, 18, 6, '2026-02-15 12:00:00', '2026-02-15 14:00:00', 2800.00, 'Re-calibrated Hall-effect current transducers against Class 0.2 reference meter.'),
(14, 19, 5, '2026-02-18 11:00:00', '2026-02-18 13:00:00', 1500.00, 'Verified energy metering accuracy within IEC 62053-21 limits.');

-- ============================================================================
-- 19. REVIEW (24 Ratings and Customer Reviews)
-- ============================================================================
INSERT INTO review (review_id, user_id, station_id, rating, comment, created_at) VALUES
(1,   7,  1, 5, 'Blazing fast 120kW charging! Got from 20% to 80% on my Nexon EV in 35 mins. Clean bay.', '2026-02-01 10:15:00'),
(2,   8,  1, 4, 'Very convenient location right on OMR. Well-lit at night and security guard was helpful.',   '2026-02-02 08:30:00'),
(3,   9,  3, 4, 'Good charging speed at Guindy. Plenty of open parking spots while waiting.',             '2026-02-03 16:00:00'),
(4,  10,  4, 5, 'Best EV station in Indiranagar. Café right next door made the charging wait enjoyable.', '2026-02-04 12:00:00'),
(5,  11,  5, 4, 'Reliable fast charger in Electronic City. App showed real-time slot accurately.',        '2026-02-05 18:00:00'),
(6,  12,  5, 5, 'Great charging rates and seamless wallet deduction. Very impressed by Voltix!',          '2026-02-06 09:30:00'),
(7,  13,  7, 5, 'Extremely useful charging point at VIT Vellore campus. High power output throughout.',   '2026-02-07 20:10:00'),
(8,  14,  8, 3, 'Station is good but Katpadi traffic around station road is congested during peak hrs.',   '2026-02-08 13:00:00'),
(9,  15,  9, 5, 'Ultra-fast 120kW worked wonders on my Ioniq 5 in Hitec City. Peak speed reached 135kW!', '2026-02-09 15:00:00'),
(10, 16, 12, 4, 'Convenient stop at Hinjewadi IT park. Easy plug-and-play session initiation.',           '2026-02-10 17:00:00'),
(11,  7,  2, 3, 'One charger was out of order at Anna Nagar, but second gun worked fine.',                '2026-02-11 11:30:00'),
(12,  8,  2, 4, 'Pleasant experience at Anna Nagar plaza. Dedicated EV bays prevent ICE-ing.',            '2026-02-12 14:00:00'),
(13,  9,  4, 4, 'Consistent voltage and current output. Battery topped up with no thermal throttling.',   '2026-02-13 18:45:00'),
(14, 10,  9, 5, 'Hyderabad hub is state of the art. Covered canopy protects well from the sun.',         '2026-02-14 11:00:00'),
(15, 11, 12, 4, 'Great charging setup in Hinjewadi. Smooth contactless payment via wallet.',              '2026-02-15 16:20:00'),
(16, 12,  4, 5, 'Indiranagar station is always my first choice in Bengaluru. 10/10.',                    '2026-02-16 12:45:00'),
(17, 13,  8, 4, 'Saved my trip from Chennai to Bengaluru with a quick top-up in Vellore.',               '2026-02-17 17:30:00'),
(18, 14, 11, 4, 'Coimbatore RS Puram station is neat and functional. Fast 50kW DC charger.',             '2026-02-18 12:00:00'),
(19, 15, 10, 5, 'Superb infrastructure in Hitec City. Never encountered any queue or breakdown.',         '2026-02-19 21:00:00'),
(20,  7,  3, 3, 'Industrial area around Guindy gets a bit dusty, but charging speeds are solid.',         '2026-02-20 15:30:00'),
(21,  8,  3, 4, 'Charged my ZS EV quickly before highway drive. Smooth billing.',                         '2026-02-21 13:10:00'),
(22, 10,  3, 4, 'Good backup power generators in place in Guindy.',                                       '2026-02-22 18:00:00'),
(23, 12,  6, 4, 'Quick charging and clear meter display on screen.',                                      '2026-02-23 14:30:00'),
(24, 16, 10, 4, 'Gachibowli GreenHub has good parking space and fast connectivity.',                      '2026-02-24 19:30:00');

-- ============================================================================
-- 20. USER_PROMOTION (14 Promotion Redemptions)
-- ============================================================================
INSERT INTO user_promotion (user_id, promotion_id, used_at) VALUES
(7,  1, '2026-02-01 09:00:00'),
(8,  1, '2026-02-01 11:00:00'),
(9,  1, '2026-02-02 14:00:00'),
(10, 1, '2026-02-03 10:30:00'),
(11, 2, '2026-02-04 16:00:00'),
(12, 3, '2026-02-05 08:00:00'),
(13, 3, '2026-02-06 18:30:00'),
(14, 2, '2026-02-07 11:00:00'),
(15, 3, '2026-02-08 13:00:00'),
(16, 1, '2026-02-09 15:00:00'),
(7,  3, '2026-02-10 10:00:00'),
(8,  3, '2026-02-11 12:00:00'),
(10, 3, '2026-02-13 09:30:00'),
(12, 1, '2026-02-15 11:00:00');

SELECT 'Successfully populated comprehensive sample data across all 20 tables.' AS status;
