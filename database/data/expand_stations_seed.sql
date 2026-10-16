-- ============================================================================
-- VOLTIX: Urban EV Charging Network Management System
-- Script: expand_stations_seed.sql
-- Description: Idempotent network expansion script adding realistic demo charging
--              stations across Mumbai, Delhi NCR, Bengaluru, Chennai, Hyderabad, and Pune.
-- Total Target Stations: 22 Stations across 8 Indian Cities.
-- ============================================================================

USE voltix_db;

-- 1. Ensure Expanded Cities exist
INSERT INTO city (city_id, city_name, state) VALUES
(7, 'Mumbai',    'Maharashtra'),
(8, 'Delhi NCR',  'Delhi')
ON DUPLICATE KEY UPDATE city_name = VALUES(city_name);

-- 2. Insert 10 Additional Charging Stations Idempotently
INSERT INTO charging_station (station_id, city_id, operator_id, station_name, latitude, longitude, address, status) VALUES
(13, 7, 2, 'BKC Financial Superhub',          19.0657140, 72.8683210, 'G-Block, Bandra Kurla Complex, Bandra East, Mumbai',             'ACTIVE'),
(14, 7, 3, 'Andheri West Metro ChargePark',   19.1363210, 72.8276540, 'Link Road, Near Infinity Mall, Andheri West, Mumbai',              'ACTIVE'),
(15, 7, 4, 'Navi Mumbai Highway VoltPoint',   19.0330490, 73.0296620, 'Sion-Panvel Expressway, Vashi Sector 17, Navi Mumbai',            'ACTIVE'),
(16, 8, 2, 'Connaught Place EV Hub',          28.6315200, 77.2167210, 'Outer Circle, Connaught Place, New Delhi',                          'ACTIVE'),
(17, 8, 3, 'Aerocity Hospitality VoltStation', 28.5524100, 77.1219400, 'Asset 5B, Hospitality District, IGI Airport, New Delhi',           'ACTIVE'),
(18, 8, 4, 'Cyber City Expressway FastCharge', 28.4950200, 77.0895400, 'DLF Cyber City, Building 10 Tower B, Gurugram NCR',                 'ACTIVE'),
(19, 2, 3, 'Koramangala 80-Feet Voltix Plaza', 12.9352100, 77.6245300, '80 Feet Main Road, 4th Block, Koramangala, Bengaluru',             'ACTIVE'),
(20, 1, 2, 'T. Nagar Commercial EV Bay',      13.0418200, 80.2341400, 'South Usman Road, Near Panagal Park, T. Nagar, Chennai',           'ACTIVE'),
(21, 4, 2, 'Banjara Hills GreenCharger',      17.4156100, 78.4350200, 'Road No. 12, Banjara Hills, Hyderabad',                             'ACTIVE'),
(22, 6, 3, 'Kothrud VoltCharge Terminal',     18.5074200, 73.8077400, 'Paud Road, Near Vanaz Corner, Kothrud, Pune',                      'ACTIVE')
ON DUPLICATE KEY UPDATE 
    latitude = VALUES(latitude),
    longitude = VALUES(longitude),
    address = VALUES(address);

-- 3. Insert Corresponding Physical Chargers (Charger IDs 37 through 68)
INSERT INTO charger (charger_id, station_id, charger_type_id, charger_number, status) VALUES
-- Station 13: BKC Financial Superhub (Mumbai)
(37, 13, 2, 'BKC-CH01',   'AVAILABLE'),
(38, 13, 1, 'BKC-CH02',   'AVAILABLE'),
(39, 13, 4, 'BKC-CH03',   'OCCUPIED'),
(40, 13, 5, 'BKC-CH04',   'AVAILABLE'),

-- Station 14: Andheri West Metro ChargePark (Mumbai)
(41, 14, 1, 'AND-CH01',   'AVAILABLE'),
(42, 14, 4, 'AND-CH02',   'AVAILABLE'),
(43, 14, 1, 'AND-CH03',   'MAINTENANCE'),

-- Station 15: Navi Mumbai Highway VoltPoint (Mumbai)
(44, 15, 2, 'NM-CH01',    'AVAILABLE'),
(45, 15, 1, 'NM-CH02',    'OCCUPIED'),
(46, 15, 4, 'NM-CH03',    'AVAILABLE'),

-- Station 16: Connaught Place EV Hub (Delhi)
(47, 16, 2, 'CP-CH01',    'AVAILABLE'),
(48, 16, 1, 'CP-CH02',    'AVAILABLE'),
(49, 16, 4, 'CP-CH03',    'OCCUPIED'),
(50, 16, 5, 'CP-CH04',    'AVAILABLE'),

-- Station 17: Aerocity Hospitality VoltStation (Delhi)
(51, 17, 2, 'AERO-CH01',  'AVAILABLE'),
(52, 17, 1, 'AERO-CH02',  'AVAILABLE'),
(53, 17, 4, 'AERO-CH03',  'AVAILABLE'),

-- Station 18: Cyber City Expressway FastCharge (Delhi/NCR)
(54, 18, 2, 'CYBER-CH01', 'OCCUPIED'),
(55, 18, 1, 'CYBER-CH02', 'AVAILABLE'),
(56, 18, 4, 'CYBER-CH03', 'AVAILABLE'),

-- Station 19: Koramangala 80-Feet Voltix Plaza (Bengaluru)
(57, 19, 1, 'KOR-CH01',   'AVAILABLE'),
(58, 19, 2, 'KOR-CH02',   'AVAILABLE'),
(59, 19, 4, 'KOR-CH03',   'OCCUPIED'),

-- Station 20: T. Nagar Commercial EV Bay (Chennai)
(60, 20, 1, 'TN-CH01',    'AVAILABLE'),
(61, 20, 4, 'TN-CH02',    'AVAILABLE'),
(62, 20, 5, 'TN-CH03',    'AVAILABLE'),

-- Station 21: Banjara Hills GreenCharger (Hyderabad)
(63, 21, 2, 'BH-CH01',    'AVAILABLE'),
(64, 21, 1, 'BH-CH02',    'AVAILABLE'),
(65, 21, 4, 'BH-CH03',    'AVAILABLE'),

-- Station 22: Kothrud VoltCharge Terminal (Pune)
(66, 22, 1, 'KOT-CH01',   'AVAILABLE'),
(67, 22, 4, 'KOT-CH02',   'AVAILABLE'),
(68, 22, 5, 'KOT-CH03',   'OCCUPIED')
ON DUPLICATE KEY UPDATE 
    status = VALUES(status);
