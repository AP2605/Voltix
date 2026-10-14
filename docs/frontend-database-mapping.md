# VOLTIX — Frontend ↔ Database Mapping Specification

**Project:** VOLTIX — Urban EV Charging Network Management System  
**Academic Milestone:** DBMS Review 1 (Week 4 — Frontend Prototype & Database Alignment)  
**Database Name:** `voltix_db` (MySQL 8.0+)  
**Future Backend Stack:** Java Spring Boot 3.x REST API Architecture  

---

## 1. Architectural Philosophy

The VOLTIX frontend is not a superficial mockup; every view, table, card, filter, and metric corresponds directly to the underlying normalized MySQL relational schema. 

This document details the exact mapping from each user-facing screen to the relevant database tables, views, stored procedures, and the planned Spring Boot REST endpoints.

---

## 2. Master Mapping Matrix

| UI Feature / Screen | Primary Database Entity | Supporting Entities / Views | MySQL Stored Routine | Future Spring Boot Endpoint | HTTP Method |
|---|---|---|---|---|---|
| **User Sign In** (`/login`) | `user` | — | Direct index lookup on `email` | `/api/auth/login` | `POST` |
| **User Registration** (`/register`) | `user` | `wallet` (auto-created) | Checks `uq_user_email`, `chk_user_role` | `/api/auth/register` | `POST` |
| **Driver Profile** (`/profile`) | `user`, `vehicle` | `vehicle_model` | Enforces `uq_vehicle_registration` | `/api/users/profile`, `/api/vehicles` | `GET`, `POST` |
| **Customer Dashboard** (`/dashboard`) | `user`, `vehicle` | `charging_session`, `charging_station`, `wallet` | Query on active status | `/api/dashboard/summary` | `GET` |
| **Station Search & Discovery** (`/stations`) | `charging_station` | `city`, `charger`, `charger_type`, `view: available_chargers` | Spatial bounding box + status filter | `/api/stations` | `GET` |
| **Interactive Station Map** (`/stations`) | `charging_station` | `city` | Reads `latitude`, `longitude` coordinates | `/api/stations/geo` | `GET` |
| **Station Details** (`/stations/:id`) | `charging_station` | `charger`, `charger_type`, `review`, `pricing_rule` | Joined bay catalog & customer feedback | `/api/stations/{id}` | `GET` |
| **Dynamic Tariff Schedule** (`/stations/:id`) | `pricing_rule` | `pricing_plan` | Matches ToU windows (`PEAK`, `OFF_PEAK`) | `/api/pricing/station/{id}` | `GET` |
| **Slot Reservation** (`/reservation/:stationId`) | `reservation` | `charger`, `vehicle`, `user` | **`reserve_charger()`** (Pessimistic row lock `FOR UPDATE`) | `/api/reservations` | `POST` |
| **Live Charging Telemetry** (`/charging`) | `charging_session` | `meter_reading`, `charger`, `vehicle` | **`start_charging()`**, periodic telemetry writes | `/api/sessions/active` | `GET` |
| **Session Conclusion** (`/charging`) | `charging_session` | `reservation`, `vehicle`, `charger` | **`end_charging()`**, **`calculate_charging_cost()`** | `/api/sessions/{id}/end` | `POST` |
| **Invoice Settlement** (`/payment/:sessionId`) | `payment` | `charging_session`, `wallet`, `wallet_transaction`, `promotion` | **`process_payment()`** (Atomic ledger debit) | `/api/payments/process` | `POST` |
| **Digital Wallet Ledger** (`/wallet`) | `wallet` | `wallet_transaction` | Enforces `chk_wallet_balance >= 0` | `/api/wallet` | `GET` |
| **Wallet Top-Up** (`/wallet`) | `wallet` | `wallet_transaction` | ACID double-entry credit ledger | `/api/wallet/topup` | `POST` |
| **Audit History** (`/history`) | `charging_session` | `reservation`, `payment`, `view: user_charging_history` | Temporal sorting (`ORDER BY created_at DESC`) | `/api/history/sessions` | `GET` |
| **Operator Hub Overview** (`/operator`) | `charging_station` | `charger`, `charging_session`, `maintenance_request` | **`get_station_occupancy()`** | `/api/operator/overview` | `GET` |
| **Charger Fleet Grid** (`/operator`) | `charger` | `charging_station`, `charger_type`, `view: charger_health` | Status grouping & failure tracking | `/api/operator/chargers` | `GET` |
| **Admin Network Analytics** (`/admin`) | `charging_station` | `payment`, `city`, `view: station_revenue` | Aggregate window queries (`RANK()`, `SUM() OVER()`) | `/api/admin/analytics/revenue` | `GET` |
| **Admin Top Stations** (`/admin`) | `charging_station` | `view: station_revenue` | Turnover sorting (`ORDER BY total_revenue DESC`) | `/api/admin/analytics/stations` | `GET` |

---

## 3. Detailed Data Flow Examples

### 3.1 Reservation Workflow
```
[Frontend: Reservation.jsx]
        │
        ▼ (POST /api/reservations)
[Spring Boot: ReservationController.java]
        │
        ▼ (CALL reserve_charger(p_user_id, p_vehicle_id, p_charger_id, p_start_time, p_end_time, ...))
[MySQL 8.0: voltix_db]
        ├─ 1. Check user status == 'ACTIVE'
        ├─ 2. Check charger status NOT IN ('MAINTENANCE', 'OFFLINE')
        ├─ 3. SELECT ... FROM reservation WHERE charger_id = ... FOR UPDATE (Lock)
        ├─ 4. Verify (p_start_time < end_time AND p_end_time > start_time) count == 0
        ├─ 5. INSERT INTO reservation (...) VALUES (...)
        └─ 6. COMMIT
```

### 3.2 Live Charging & Metering
```
[Frontend: ChargingSession.jsx]
        │
        ├─ Displays vehicle State-of-Charge (SoC) %
        ├─ Displays live power (kW), voltage (V), current (A)
        │
        ▼ (Maps directly to:)
[Database Entities]
        ├─ CHARGING_SESSION (session_id, start_time, duration_minutes, energy_consumed)
        └─ METER_READING (reading_id, session_id, reading_time, voltage, current, energy_kwh)
```

### 3.3 Wallet Payment & Double-Entry Ledger
```
[Frontend: Payment.jsx]
        │
        ▼ (POST /api/payments/process)
[Spring Boot: PaymentController.java]
        │
        ▼ (CALL process_payment(p_session_id, p_user_id, 'WALLET', ...))
[MySQL 8.0: voltix_db]
        ├─ 1. SELECT balance FROM wallet WHERE user_id = ... FOR UPDATE
        ├─ 2. Check balance >= session_cost (Overdraft guard)
        ├─ 3. UPDATE wallet SET balance = balance - session_cost
        ├─ 4. INSERT INTO wallet_transaction (wallet_id, amount, transaction_type='DEBIT')
        ├─ 5. INSERT INTO payment (session_id, user_id, amount, payment_method='WALLET', status='SUCCESS')
        └─ 6. COMMIT
```

---

## 4. Key Takeaways for Professor / Evaluator

1. **True Database Cohesion:** Every element on the frontend corresponds to real SQL attributes (e.g. battery capacities, connector ratings, ToU pricing rules).
2. **ACID Transaction Visuals:** Success and error states mirror the exact rollback logic embedded in our MySQL procedures.
3. **Multi-Persona Access:** Driver, Operator, and Administrator dashboards demonstrate how different personas query the unified normalized schema.
