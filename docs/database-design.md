# VOLTIX — Database Design & Technical Specification Document

**Project Name:** VOLTIX — Urban EV Charging Network Management System  
**Academic Milestone:** DBMS Review 1 (Week 3 — Database Implementation)  
**Database Engine:** MySQL 8.0+ (InnoDB Storage Engine)  
**Encoding:** `utf8mb4` with `utf8mb4_unicode_ci` Collation  

---

## 1. Database Overview

VOLTIX is an enterprise-grade centralized management system designed for urban electric vehicle (EV) charging infrastructure across major Indian metropolitan hubs. The database acts as the single source of truth for all network operations: user registration, vehicle telemetry, charging station deployment, dynamic Time-of-Use (ToU) tariffs, advance slot reservation, live charging sessions, real-time meter readings, automated billing, digital wallet ledgers, preventive hardware maintenance, and customer reviews.

### Key Highlights:
- **Relational Tables:** 20 fully normalized tables (Engineered to 3NF).
- **Referential Integrity:** Comprehensive Foreign Key cascades and restrictive rules preserving financial and audit histories.
- **Data Protection:** Domain CHECK constraints, UNIQUE business keys, and pessimistic locking transactions.
- **Programmability:** 5 Stored Procedures, 2 Stored Functions, 4 Triggers, and 4 Materialized Views.
- **Analytics & BI:** Sophisticated SQL scripts featuring multi-table joins, subqueries, and window functions (`RANK()`, `ROW_NUMBER()`, `SUM() OVER()`).

---

## 2. Entity List (20 Tables)

| # | Entity Name | Table Name | Description |
|---|---|---|---|
| 1 | User | `user` | Stores consumer, operator, technician, and admin accounts. |
| 2 | City | `city` | Geographic directory of operational cities and states. |
| 3 | Vehicle Model | `vehicle_model` | OEM specifications (battery capacity in kWh, peak charging rate in kW). |
| 4 | Charger Type | `charger_type` | Connector hardware classifications (CCS2, CHAdeMO, Type 2, GB/T). |
| 5 | Pricing Plan | `pricing_plan` | Tariff categories (STANDARD, PEAK, OFF_PEAK, PREMIUM). |
| 6 | Promotion | `promotion` | Marketing coupon codes, percentage/fixed discounts, and validity dates. |
| 7 | Vehicle | `vehicle` | Individual EV vehicles owned by registered users. |
| 8 | Charging Station | `charging_station` | Physical charging hubs deployed across cities, assigned to station operators. |
| 9 | Charger | `charger` | Individual charging bays/guns with real-time operational status. |
| 10 | Reservation | `reservation` | Advance slot bookings with conflict prevention. |
| 11 | Charging Session | `charging_session` | Physical charging sessions recording duration, kWh dispensed, and cost. |
| 12 | Meter Reading | `meter_reading` | High-frequency telemetry (voltage, current, cumulative energy). |
| 13 | Pricing Rule | `pricing_rule` | Time-of-day and day-type tariff rates per pricing plan. |
| 14 | Payment | `payment` | Financial transaction settlements for completed charging sessions. |
| 15 | Wallet | `wallet` | Prepaid digital balance ledger (1:1 with user). |
| 16 | Wallet Transaction | `wallet_transaction` | Immutable double-entry audit trail (CREDIT, DEBIT, REFUND). |
| 17 | Maintenance Request | `maintenance_request` | Hardware trouble tickets and technician dispatch tickets. |
| 18 | Maintenance Record | `maintenance_record` | Completed repair logs, labor costs, parts replacement, and descriptions. |
| 19 | Review | `review` | Customer star ratings (1–5) and written feedback per station. |
| 20 | User Promotion | `user_promotion` | Associative table recording promotional coupon redemptions. |

---

## 3. Relationship Explanation (Cardinalities)

```
[USER] 1 : N [VEHICLE]
[VEHICLE_MODEL] 1 : N [VEHICLE]
[CITY] 1 : N [CHARGING_STATION]
[USER (OPERATOR)] 1 : N [CHARGING_STATION]
[CHARGING_STATION] 1 : N [CHARGER]
[CHARGER_TYPE] 1 : N [CHARGER]
[USER] 1 : N [RESERVATION]
[VEHICLE] 1 : N [RESERVATION]
[CHARGER] 1 : N [RESERVATION]
[RESERVATION] 1 : 1 [CHARGING_SESSION] (Optional 1:1, walk-ins supported)
[VEHICLE] 1 : N [CHARGING_SESSION]
[CHARGER] 1 : N [CHARGING_SESSION]
[CHARGING_SESSION] 1 : N [METER_READING]
[CHARGING_SESSION] 1 : 1 [PAYMENT]
[USER] 1 : 1 [WALLET]
[WALLET] 1 : N [WALLET_TRANSACTION]
[CHARGER] 1 : N [MAINTENANCE_REQUEST]
[MAINTENANCE_REQUEST] 1 : N [MAINTENANCE_RECORD]
[USER] 1 : N [REVIEW]
[CHARGING_STATION] 1 : N [REVIEW]
[PRICING_PLAN] 1 : N [PRICING_RULE]
[USER] N : M [PROMOTION] (via USER_PROMOTION)
```

---

## 4. Primary Keys

All 20 tables implement explicit Primary Key constraints:
- **Surrogate Auto-Increment Keys (`INT AUTO_INCREMENT`):**  
  Used on 19 tables (`pk_user`, `pk_city`, `pk_vehicle_model`, `pk_charger_type`, `pk_pricing_plan`, `pk_promotion`, `pk_vehicle`, `pk_charging_station`, `pk_charger`, `pk_reservation`, `pk_charging_session`, `pk_meter_reading`, `pk_pricing_rule`, `pk_payment`, `pk_wallet`, `pk_wallet_transaction`, `pk_maintenance_request`, `pk_maintenance_record`, `pk_review`).
- **Composite Primary Key:**  
  `user_promotion` uses `PRIMARY KEY (user_id, promotion_id)` (`pk_user_promotion`) as the natural composite key for the associative table.

---

## 5. Foreign Key Strategy & Referential Actions

Referential policies are strictly chosen based on real-world transactional and audit constraints:

1. **`ON DELETE RESTRICT` (Audit and History Preservation):**
   - Applied to transactional entities: `reservation`, `charging_session`, `payment`, `wallet_transaction`, and `maintenance_record`.
   - Prevents accidental deletion of users or vehicles that would orphan financial, tax, or legal audit trails.
2. **`ON DELETE CASCADE` (Parent-Child Containment):**
   - `meter_reading` $\rightarrow$ `charging_session`: If a test session is deleted, its telemetry readings are safely purged.
   - `charger` $\rightarrow$ `charging_station`: Physical bays belong strictly to a physical facility.
   - `pricing_rule` $\rightarrow$ `pricing_plan`: Rules belong entirely to the parent plan.
   - `review` $\rightarrow$ `charging_station`: Reviews belong to the station.
3. **`ON DELETE SET NULL` (Staff Profile Decommissioning):**
   - `maintenance_request.technician_id`: If a technician user leaves the organization, historical maintenance tickets retain all incident data with technician unassigned.

---

## 6. Constraints Summary

### 6.1 Unique Constraints
- `uq_user_email`: Email addresses must be strictly unique.
- `uq_user_phone`: Phone numbers must be unique.
- `uq_vehicle_registration`: Vehicle license plates are globally unique.
- `uq_charger_station_number`: Charger numbers (`CH-01`, etc.) are unique per station.
- `uq_session_reservation`: Enforces 1:1 reservation-to-session relationship.
- `uq_payment_session`: Enforces single payment settlement per session.
- `uq_wallet_user`: Enforces exactly one digital wallet per user account.
- `uq_review_user_station`: Prevents multiple reviews by the same user on the same station.

### 6.2 Domain CHECK Constraints
- `chk_user_role`: `role IN ('USER', 'OPERATOR', 'TECHNICIAN', 'ADMIN')`
- `chk_user_status`: `status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')`
- `chk_vehicle_battery_percentage`: `battery_percentage BETWEEN 0.00 AND 100.00`
- `chk_station_latitude` & `chk_station_longitude`: Valid coordinate ranges.
- `chk_charger_status`: `status IN ('AVAILABLE', 'OCCUPIED', 'RESERVED', 'MAINTENANCE', 'OFFLINE')`
- `chk_reservation_time_interval`: `start_time < end_time`
- `chk_session_energy`: `energy_consumed >= 0.00`
- `chk_wallet_balance`: `balance >= 0.00` (Strict database-level overdraft prevention)
- `chk_wallet_tx_amount`: `amount > 0.00`
- `chk_review_rating`: `rating BETWEEN 1 AND 5`

---

## 7. Normalization (1NF $\rightarrow$ 3NF)

The schema eliminates insertion, update, and deletion anomalies by achieving **Third Normal Form (3NF)**:
1. **1NF:** Multi-valued vehicle and meter telemetry arrays were decomposed into atomic tables (`vehicle`, `meter_reading`).
2. **2NF:** Composite key partial dependencies in promotions were factored out into `promotion` and `user_promotion`.
3. **3NF:** Transitive dependencies were systematically resolved:
   - `vehicle -> model_id -> (manufacturer, capacity, power)` $\implies$ `vehicle_model` table.
   - `charging_station -> city_id -> state` $\implies$ `city` table.
   - `charger -> charger_type_id -> (connector, power)` $\implies$ `charger_type` table.
   - Separate `reservation` (planned slot) and `charging_session` (actual runtime).

---

## 8. Indexing Strategy

B-Tree secondary indexes are configured to optimize query latency and prevent table scans:

1. **`idx_reservation_charger_time` on `reservation(charger_id, start_time, end_time)`:**  
   Optimizes interval overlap detection during slot bookings.
2. **`idx_charger_station` on `charger(station_id)`:**  
   Accelerates station details view and bay status lookups.
3. **`idx_charger_type` on `charger(charger_type_id)`:**  
   Speeds up connector compatibility filtering in customer searches.
4. **`idx_reading_session_time` on `meter_reading(session_id, reading_time)`:**  
   Composite index for rapid chronological telemetry charting.
5. **`idx_payment_user` on `payment(user_id)`:**  
   Accelerates customer billing history retrieval.
6. **`idx_maint_request_charger` on `maintenance_request(charger_id)`:**  
   Optimizes automated health-check queries in maintenance triggers.

---

## 9. Transactions & ACID Compliance

All state modifications are wrapped in explicit ACID transactions:
- **Atomicity:** Any failed validation or exception triggers a complete `ROLLBACK`.
- **Consistency:** Domain checks and foreign keys guarantee that the database transitions strictly between valid states.
- **Isolation:** Critical workflows use pessimistic row-level locking (`SELECT ... FOR UPDATE`) to prevent race conditions during concurrent bookings or wallet payments.
- **Durability:** The InnoDB transactional redo log guarantees that committed state is permanently stored.

---

## 10. Stored Procedures

### 1. `reserve_charger(p_user_id, p_vehicle_id, p_charger_id, p_start_time, p_end_time, OUT p_res_id, OUT p_code, OUT p_msg)`
- Validates user standing and vehicle ownership.
- Checks charger health (`MAINTENANCE`/`OFFLINE` rejected).
- Enforces chronological interval validity.
- Performs overlap check under row lock: `(p_start_time < end_time AND p_end_time > start_time)`.
- Transitions charger to `RESERVED` if start time is imminent.

### 2. `start_charging(p_reservation_id, OUT p_session_id, OUT p_code, OUT p_msg)`
- Validates confirmed reservation status.
- Atomically creates `charging_session` row.
- Transitions `reservation.status = 'ACTIVE'` and `charger.status = 'OCCUPIED'`.
- Records initial baseline meter reading ($t=0$).

### 3. `end_charging(p_session_id, OUT p_final_cost, OUT p_code, OUT p_msg)`
- Calculates elapsed session duration in minutes.
- Derives energy consumed from meter readings ($\Delta kWh$).
- Invokes `calculate_charging_cost(p_session_id)`.
- Restores `charger.status = 'AVAILABLE'` and marks reservation `COMPLETED`.
- Updates vehicle battery percentage based on energy delivered.

### 4. `process_payment(p_session_id, p_user_id, p_payment_method, OUT p_payment_id, OUT p_code, OUT p_msg)`
- Verifies session billing liability and user ownership.
- If `p_payment_method = 'WALLET'`:
  - Locks `wallet` row via `SELECT ... FOR UPDATE`.
  - Checks if balance $\ge$ cost. If insufficient, records failed attempt and rolls back.
  - Deducts balance and logs an immutable `DEBIT` entry in `wallet_transaction`.
- Sets payment status to `SUCCESS` and commits atomically.

### 5. `station_report(p_station_id, p_start_date, p_end_date)`
- Aggregates operational performance: sessions, kWh dispensed, gross revenue, occupancy %, active maintenance tickets, and average customer star ratings.

---

## 11. Stored Functions

### 1. `calculate_charging_cost(p_session_id)` $\rightarrow$ `DECIMAL(10, 2)`
- Analyzes session timestamp and matches dynamic tariff rules (`WEEKDAY` vs `WEEKEND`, Peak vs Off-Peak).
- Computes gross energy cost ($kWh \times rate$).
- Adds idle overstay penalties if session duration exceeds 90 minutes.
- Applies user promotional discounts (percentage or fixed).
- Returns non-negative final billing cost.

### 2. `get_station_occupancy(p_station_id)` $\rightarrow$ `DECIMAL(5, 2)`
- Calculates:
  $$\text{Occupancy Rate} = \frac{\text{Occupied Chargers} + \text{Reserved Chargers}}{\text{Total Chargers}} \times 100\%$$
- Implements zero-division protection for stations with zero chargers.

---

## 12. Triggers

1. **`trg_session_start_charger_occupied` (AFTER INSERT ON `charging_session`):**  
   Automatically shifts `charger.status = 'OCCUPIED'` when a session is inserted.
2. **`trg_session_end_charger_available` (AFTER UPDATE ON `charging_session`):**  
   Automatically restores `charger.status = 'AVAILABLE'` when `end_time` is finalized.
3. **`trg_reservation_cancelled_release_charger` (AFTER UPDATE ON `reservation`):**  
   Releases a `RESERVED` charger back to `AVAILABLE` when a booking is cancelled.
4. **`trg_maintenance_alert` (AFTER INSERT ON `maintenance_request`):**  
   Monitors incident frequency. If 3 or more tickets occur within 30 days, or if ticket priority is `CRITICAL`, automatically flags `charger.status = 'MAINTENANCE'`. Non-recursive design.

---

## 13. Views

1. **`available_chargers`:** Public discovery view filtering for active stations and available chargers with connector specifications and base rates.
2. **`station_revenue`:** Aggregated station financial view reporting total sessions, energy dispensed, and settled revenue.
3. **`charger_health`:** Diagnostic dashboard monitoring maintenance frequency, open tickets, and repair expenditure.
4. **`user_charging_history`:** Comprehensive customer audit view joining user, vehicle, model, session, charger, station, and payment details.

---

## 14. Analytical & Business Intelligence Queries

- **Peak Charging Hours Analysis:** Identifies grid demand spikes across daytime, evening, and night windows.
- **Popular Vehicle Models:** Ranks models by total energy consumption and registration count.
- **Charger Failure Index:** Surfaces hardware units with recurring maintenance incidents.
- **Top Customer Portfolio:** Identifies VIP fleet drivers by total lifetime spend.
- **Green Environmental Impact:** Computes avoided carbon emissions ($0.82\text{ kg CO}_2\text{ saved per kWh}$).
- **Revenue Benchmark (CTE):** Compares individual station revenue against respective city benchmark averages.
