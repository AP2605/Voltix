# VOLTIX — Urban EV Charging Network Management System

[![MySQL](https://img.shields.io/badge/MySQL-8.0+-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Java Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

**VOLTIX** is a centralized management system designed for municipal electric vehicle (EV) charging networks. It bridges EV drivers, charging station operators, field maintenance technicians, and administrators through a unified, high-integrity database and service architecture.

---

## Repository Structure

```
VOLTIX/
├── README.md
├── .gitignore
├── LICENSE
├── docker-compose.yml
├── docs/
│   ├── database-design.md
│   ├── normalization.md
│   ├── er-diagram.png
│   ├── relational-schema.png
│   ├── architecture.png
│   ├── use-case-diagram.png
│   └── screenshots/
├── database/
│   ├── schema/
│   │   ├── 01_create_database.sql
│   │   ├── 02_tables.sql
│   │   ├── 03_constraints.sql
│   │   └── 04_indexes.sql
│   ├── data/
│   │   └── sample_data.sql
│   ├── procedures/
│   │   ├── reserve_charger.sql
│   │   ├── start_charging.sql
│   │   ├── end_charging.sql
│   │   ├── process_payment.sql
│   │   └── station_report.sql
│   ├── functions/
│   │   ├── calculate_charging_cost.sql
│   │   └── get_station_occupancy.sql
│   ├── triggers/
│   │   ├── charger_status.sql
│   │   ├── charger_occupancy.sql
│   │   ├── charger_release.sql
│   │   ├── reservation_status.sql
│   │   ├── reservation_cancel.sql
│   │   └── maintenance_alert.sql
│   ├── views/
│   │   ├── available_chargers.sql
│   │   ├── station_revenue.sql
│   │   ├── charger_health.sql
│   │   └── user_charging_history.sql
│   └── queries/
│       ├── basic_queries.sql
│       ├── joins.sql
│       ├── aggregate_queries.sql
│       ├── subqueries.sql
│       ├── window_functions.sql
│       ├── analytics.sql
│       └── test_cases.sql
├── backend/
└── frontend/
```

---

## Database

### Specifications
- **RDBMS Engine:** MySQL 8.0+ (InnoDB Storage Engine)
- **Database Name:** `voltix_db`
- **Character Set & Collation:** `utf8mb4` / `utf8mb4_unicode_ci`
- **Total Relational Tables:** 20 tables

### Major Entities
1. **`user`**: Consumers, station operators, technicians, and system administrators.
2. **`city`**: Municipalities & states where infrastructure is deployed.
3. **`vehicle_model`**: OEM specifications (battery capacity in kWh, peak charging rate in kW).
4. **`charger_type`**: Hardware connector standards (CCS2, CHAdeMO, Type 2, GB/T).
5. **`pricing_plan`**: Plan categories (STANDARD, PEAK, OFF_PEAK, PREMIUM).
6. **`promotion`**: Promotional codes, percentage/fixed discounts, and validity dates.
7. **`vehicle`**: Registered EV units linked to users with State-of-Charge (SoC).
8. **`charging_station`**: Physical charging hubs assigned to station operators.
9. **`charger`**: Individual charging points/guns with real-time hardware status.
10. **`reservation`**: Advance slot reservations with conflict prevention.
11. **`charging_session`**: Actual runtime charging sessions with energy consumed and duration.
12. **`meter_reading`**: Periodic telemetry samples (voltage, current, cumulative kWh).
13. **`pricing_rule`**: Dynamic time-of-day and day-type tariff rules.
14. **`payment`**: Billing settlement transactions (WALLET, UPI, CARD).
15. **`wallet`**: Prepaid customer balances (1:1 with user, non-negative balance).
16. **`wallet_transaction`**: Immutable ledger audit trail (CREDIT, DEBIT, REFUND).
17. **`maintenance_request`**: Incident tickets and technician assignments.
18. **`maintenance_record`**: Completed repair logs, labor/parts costs, and work descriptions.
19. **`review`**: Customer star ratings (1 to 5) and station feedback.
20. **`user_promotion`**: Associative table tracking user coupon redemptions (N:M).

### Relationships
- `USER 1:N VEHICLE`
- `VEHICLE_MODEL 1:N VEHICLE`
- `CITY 1:N CHARGING_STATION`
- `USER(OPERATOR) 1:N CHARGING_STATION`
- `CHARGING_STATION 1:N CHARGER`
- `CHARGER_TYPE 1:N CHARGER`
- `USER 1:N RESERVATION`
- `VEHICLE 1:N RESERVATION`
- `CHARGER 1:N RESERVATION`
- `RESERVATION 1:1 CHARGING_SESSION` (Optional 1:1)
- `VEHICLE 1:N CHARGING_SESSION`
- `CHARGER 1:N CHARGING_SESSION`
- `CHARGING_SESSION 1:N METER_READING`
- `CHARGING_SESSION 1:1 PAYMENT`
- `USER 1:1 WALLET`
- `WALLET 1:N WALLET_TRANSACTION`
- `CHARGER 1:N MAINTENANCE_REQUEST`
- `MAINTENANCE_REQUEST 1:N MAINTENANCE_RECORD`
- `USER 1:N REVIEW`
- `CHARGING_STATION 1:N REVIEW`
- `PRICING_PLAN 1:N PRICING_RULE`
- `USER N:M PROMOTION` (via `user_promotion`)

### Normalization (3NF)
The schema satisfies **Third Normal Form (3NF)**:
- **1NF:** Atomic attributes, no repeating groups (telemetry isolated in `meter_reading`).
- **2NF:** Eliminated composite key partial dependencies (e.g. `user_promotion`).
- **3NF:** Decomposed transitive dependencies (`vehicle` $\rightarrow$ `vehicle_model`, `charging_station` $\rightarrow$ `city`, `charger` $\rightarrow$ `charger_type`). Full documentation in [`docs/normalization.md`](file:///C:/Urban%20EV%20Charging%20Network%20Mgmt%20System/Voltix/docs/normalization.md).

### Constraints
- **Primary Keys:** Surrogate auto-increment keys on 19 tables; composite key on `user_promotion(user_id, promotion_id)`.
- **Foreign Keys:** `ON DELETE RESTRICT` on audit and transactional tables (`reservation`, `charging_session`, `payment`, `wallet_transaction`, `maintenance_record`) to preserve financial history; `ON DELETE CASCADE` on tightly bounded children (`meter_reading`, `charger`, `pricing_rule`).
- **Unique Constraints:** `email`, `phone`, `registration_number`, `(station_id, charger_number)`, `(user_id, station_id)` for reviews.
- **Check Constraints:** Valid status enumerations, non-negative balances/energy/costs, `start_time < end_time`, battery percentage `[0, 100]`, rating `[1, 5]`.

### Indexes
B-Tree indexes optimize high-volume queries:
- `idx_reservation_charger_time` on `reservation(charger_id, start_time, end_time)`
- `idx_charger_station` on `charger(station_id)`
- `idx_charger_type` on `charger(charger_type_id)`
- `idx_reading_session_time` on `meter_reading(session_id, reading_time)`
- `idx_payment_user` on `payment(user_id)`
- `idx_maint_request_charger` on `maintenance_request(charger_id)`
- `idx_review_station` on `review(station_id)`

### Stored Procedures
1. **`reserve_charger()`**: Validates user, vehicle, and hardware availability; checks overlapping bookings using row-level locking (`SELECT ... FOR UPDATE`); confirms booking.
2. **`start_charging()`**: Validates booking; transitions reservation to `ACTIVE` and charger to `OCCUPIED`; initializes session and baseline meter reading.
3. **`end_charging()`**: Calculates elapsed duration, computes energy from telemetry, executes cost calculation function, restores charger to `AVAILABLE`, and updates vehicle battery SoC.
4. **`process_payment()`**: Pessimistic locking on digital wallet (`SELECT ... FOR UPDATE`), verifies balance, creates debit transaction, and settles payment atomically.
5. **`station_report()`**: Comprehensive operational, financial, utilization, and hardware diagnostic reporting per station over a date window.

### Functions
1. **`calculate_charging_cost(session_id)`**: Computes final charge combining energy consumed, Time-of-Use tariffs (Peak/Off-Peak/Standard), idle overstay penalties, and promotional coupon discounts.
2. **`get_station_occupancy(station_id)`**: Calculates percentage occupancy $(Occupied + Reserved) / Total \times 100$ with safe zero-division handling.

### Triggers
1. **`trg_session_start_charger_occupied`**: Shifts charger status to `OCCUPIED` upon session initiation.
2. **`trg_session_end_charger_available`**: Restores charger status to `AVAILABLE` upon session completion.
3. **`trg_reservation_cancelled_release_charger`**: Releases `RESERVED` charger back to `AVAILABLE` upon booking cancellation.
4. **`trg_maintenance_alert`**: Automated guard that sets charger status to `MAINTENANCE` if 3 or more incident tickets occur within 30 days or if a ticket is marked `CRITICAL`. Non-recursive design.

### Views
1. **`available_chargers`**: Active discovery catalog with connector types and baseline pricing.
2. **`station_revenue`**: Aggregate view of sessions, energy dispensed, and gross settled revenue.
3. **`charger_health`**: Diagnostics view tracking failure counts, active tickets, and repair costs.
4. **`user_charging_history`**: End-to-end timeline view joining customer, vehicle, station, charger, and invoice details.

### Transactions & ACID Guarantees
All workflows employ strict ACID transactions with rollback handlers:
- **Reservation Workflow:** `START TRANSACTION` $\rightarrow$ validate $\rightarrow$ lock charger row $\rightarrow$ verify non-overlap $\rightarrow$ insert reservation $\rightarrow$ `COMMIT`.
- **Wallet Settlement Workflow:** `START TRANSACTION` $\rightarrow$ lock wallet $\rightarrow$ check balance $\rightarrow$ deduct balance $\rightarrow$ write audit ledger $\rightarrow$ insert payment $\rightarrow$ `COMMIT`.

---

## How to Run Database

### Prerequisites
- MySQL 8.0+ installed and running.
- Access to MySQL Command Line Client, MySQL Shell, or MySQL Workbench.

### Step-by-Step Execution Order

Connect to MySQL and execute the scripts in the following exact sequence:

```sql
-- 1. Create and select database
SOURCE database/schema/01_create_database.sql;

-- 2. Create base tables
SOURCE database/schema/02_tables.sql;

-- 3. Apply Foreign Keys, Unique Keys, and Check Constraints
SOURCE database/schema/03_constraints.sql;

-- 4. Create performance indexes
SOURCE database/schema/04_indexes.sql;

-- 5. Populate sample data
SOURCE database/data/sample_data.sql;

-- 6. Compile stored functions
SOURCE database/functions/calculate_charging_cost.sql;
SOURCE database/functions/get_station_occupancy.sql;

-- 7. Compile stored procedures
SOURCE database/procedures/reserve_charger.sql;
SOURCE database/procedures/start_charging.sql;
SOURCE database/procedures/end_charging.sql;
SOURCE database/procedures/process_payment.sql;
SOURCE database/procedures/station_report.sql;

-- 8. Compile triggers
SOURCE database/triggers/charger_status.sql;
SOURCE database/triggers/reservation_status.sql;
SOURCE database/triggers/maintenance_alert.sql;

-- 9. Create views
SOURCE database/views/available_chargers.sql;
SOURCE database/views/station_revenue.sql;
SOURCE database/views/charger_health.sql;
SOURCE database/views/user_charging_history.sql;

-- 10. Run comprehensive test suite
SOURCE database/queries/test_cases.sql;

-- 11. Run analytical queries
SOURCE database/queries/analytics.sql;
```

### Automated Command Line Execution (Windows PowerShell)

You can also run all scripts sequentially using the MySQL command line utility:

```powershell
# Set MySQL credentials
$MYSQL_USER = "root"
$MYSQL_PWD  = "YOUR_PASSWORD"

# Execute in dependency order
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/schema/01_create_database.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/schema/02_tables.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/schema/03_constraints.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/schema/04_indexes.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/data/sample_data.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/functions/calculate_charging_cost.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/functions/get_station_occupancy.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/procedures/reserve_charger.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/procedures/start_charging.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/procedures/end_charging.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/procedures/process_payment.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/procedures/station_report.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/triggers/charger_status.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/triggers/reservation_status.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/triggers/maintenance_alert.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/views/available_chargers.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/views/station_revenue.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/views/charger_health.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/views/user_charging_history.sql
mysql -u $MYSQL_USER -p$MYSQL_PWD < database/queries/test_cases.sql
```

---

## Documentation Links
- [Database Technical Specification (DBMS Review 1)](file:///C:/Urban%20EV%20Charging%20Network%20Mgmt%20System/Voltix/docs/database-design.md)
- [Relational Schema Normalization (1NF, 2NF, 3NF)](file:///C:/Urban%20EV%20Charging%20Network%20Mgmt%20System/Voltix/docs/normalization.md)
