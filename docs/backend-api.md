# Voltix Backend REST API & Architecture Documentation

Voltix is an enterprise-grade Urban EV Charging Network Management System. This document details the Spring Boot 3.x REST API architecture, database routines integration, endpoint catalog, security model, and execution instructions.

---

## 1. System Architecture & Technology Stack

```
   ┌────────────────────────────────────────────────────────────┐
   │               React 18 + Vite Frontend                     │
   │           (Driver, Operator, Admin Portals)                │
   └─────────────────────────────┬──────────────────────────────┘
                                 │ HTTP / JSON (Bearer JWT)
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │             Spring Boot 3.3.4 (Java 21)                    │
   │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────┐  │
   │  │ Spring Security  │  │   REST Services  │  │ Actuator │  │
   │  │   JWT / BCrypt   │  │  & Controllers   │  │ & OpenAPI│  │
   │  └──────────────────┘  └──────────────────┘  └──────────┘  │
   │  ┌──────────────────────────────────────────────────────┐  │
   │  │     Spring Data JPA (ddl-auto=validate) + JDBC       │  │
   │  └──────────────────────────────────────────────────────┘  │
   └─────────────────────────────┬──────────────────────────────┘
                                 │ TCP (MySQL Protocol)
                                 ▼
   ┌────────────────────────────────────────────────────────────┐
   │                   MySQL 8.0 Database                       │
   │  ┌─────────────────┐ ┌───────────────────┐ ┌─────────────┐ │
   │  │ 20 Base Tables  │ │ Stored Procedures │ │ 4 Views     │ │
   │  │ & Constraints   │ │ & Functions       │ │ & Triggers  │ │
   │  └─────────────────┘ └───────────────────┘ └─────────────┘ │
   └────────────────────────────────────────────────────────────┘
```

- **Runtime & Framework**: Java 21 LTS, Spring Boot 3.3.4
- **Security**: Spring Security 6.x, JJWT 0.12.6, BCrypt password hashing (10 rounds)
- **Database Engine**: MySQL 8.0 InnoDB with row-level pessimistic locking (`SELECT ... FOR UPDATE`)
- **Object-Relational Mapping**: Spring Data JPA / Hibernate (`spring.jpa.hibernate.ddl-auto=validate`)
- **API Documentation**: SpringDoc OpenAPI 3.0 / Swagger UI (`org.springdoc:springdoc-openapi-starter-webmvc-ui:2.6.0`)
- **Testing**: JUnit 5, Mockito, AssertJ, Spring Security Test (21 passing tests)

---

## 2. Database Integration & Stored Routines

The Spring Boot backend aligns 1:1 with the database schema and natively leverages all database stored procedures, functions, triggers, and views:

### Stored Procedures
| Procedure | Method in `StoredProcedureRepository` | Purpose |
|---|---|---|
| `reserve_charger` | `reserveCharger(...)` | Row-level locking of charger slot, chronological overlap verification, reservation creation. |
| `start_charging` | `startCharging(...)` | Transition charger to `IN_USE`, start charging session, initialize first meter reading. |
| `end_charging` | `endCharging(...)` | Calculate energy consumed, compute duration and final cost, transition charger back to `AVAILABLE`. |
| `process_payment` | `processPayment(...)` | Concurrency-safe payment settlement, deducts from prepaid wallet using row-lock, issues audit ledger credit/debit. |
| `station_report` | `getStationReport(...)` | Multi-result set reporting: station metadata, financial/energy KPIs, and hardware health/reviews. |

### Stored Functions
| Function | Method in `StoredProcedureRepository` | Purpose |
|---|---|---|
| `calculate_charging_cost(session_id)` | `calculateChargingCost(id)` | Dynamic tiered pricing with peak/off-peak and idle surcharge calculation. |
| `get_station_occupancy(station_id)` | `getStationOccupancy(id)` | Returns real-time percentage occupancy of station hardware bays. |

### Triggers
- `trg_charger_occupancy`: Automatically sets charger to `IN_USE` on active session.
- `trg_charger_release`: Releases charger status back to `AVAILABLE` on session end.
- `trg_reservation_status`: Enforces charger locking on confirmed slot booking.
- `trg_reservation_cancel`: Releases charger when reservation is cancelled.
- `trg_maintenance_alert`: Automatically locks hardware into `MAINTENANCE` status upon critical ticket creation or >= 3 failures in 30 days.

### Analytical Views
- `available_chargers`: Filtered view of chargers ready for immediate driver booking.
- `station_revenue`: City- and station-aggregated financial earnings and energy throughput.
- `charger_health`: Diagnostic uptime, failure count, and MTBF hardware statistics.
- `user_charging_history`: Consolidated session log combining station, vehicle, and energy metrics.

---

## 3. Security & Role-Based Access Control

The platform enforces Role-Based Access Control (RBAC) across 4 roles:
- **`USER` / `DRIVER`**: Registered EV owners; can book slots, control charging sessions, manage registered vehicles, top-up wallet, and submit reviews.
- **`OPERATOR`**: Charging station operators; can manage station chargers, view bay occupancy, and file maintenance tickets for their hardware.
- **`TECHNICIAN`**: Field engineers; can inspect assigned maintenance tickets and log component repair records and costs.
- **`ADMIN`**: Network executives; full access to all stations, platform KPIs, user records, and financial reports.

Authentication is managed via stateless JWT Bearer tokens passed in the `Authorization: Bearer <token>` HTTP header.

---

## 4. Complete REST API Endpoint Directory

All endpoints are prefixed with `/api`.

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user account with default 0-balance digital wallet. |
| `POST` | `/api/auth/login` | Public | Authenticate email/password credentials and retrieve JWT token. |
| `GET` | `/api/auth/me` | Authenticated | Retrieve profile and authorities for current authenticated user. |

### User Management (`/api/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/users/me` | Authenticated | Get account details (name, email, phone, role, created date). |
| `PATCH` | `/api/users/me` | Authenticated | Update name or phone number with uniqueness validation. |
| `POST` | `/api/users/change-password` | Authenticated | Verify current password and update to new BCrypt-hashed password. |

### Lookup Data (`/api`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/cities` | Public | Retrieve list of covered metropolitan cities and coordinates. |
| `GET` | `/api/vehicle-models` | Public | Retrieve EV vehicle models, battery capacities, and power ratings. |

### Stations & Chargers (`/api/stations`, `/api/chargers`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/stations` | Public | Search stations by city, connector type, speed category, and availability. |
| `GET` | `/api/stations/nearby` | Public | Retrieve stations sorted by simulation proximity. |
| `GET` | `/api/stations/{id}` | Public | Detailed station specifications, real-time charger bay statuses, and reviews. |
| `GET` | `/api/stations/{id}/chargers` | Public | List all chargers installed at a station. |
| `GET` | `/api/chargers/available` | Public | Query database view `available_chargers` for real-time unbooked hardware. |
| `GET` | `/api/chargers/{id}` | Public | Hardware details and power ratings for a single charger. |

### Vehicles (`/api/vehicles`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/vehicles` | Authenticated | List all EV vehicles registered under the authenticated driver account. |
| `POST` | `/api/vehicles` | Authenticated | Register a new vehicle with registration plate and battery status. |
| `GET` | `/api/vehicles/{id}` | Authenticated | Retrieve details and estimated driving range for a vehicle. |
| `PATCH` | `/api/vehicles/{id}` | Authenticated | Update battery state-of-charge (SoC) or license plate. |
| `DELETE` | `/api/vehicles/{id}` | Authenticated | Remove vehicle from profile. |

### Slot Reservations (`/api/reservations`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reservations` | Authenticated | Book exclusive charger slot via ACID `reserve_charger` stored procedure. |
| `GET` | `/api/reservations` | Authenticated | Retrieve driver reservation history. |
| `GET` | `/api/reservations/{id}` | Authenticated | Retrieve single reservation details. |
| `POST` | `/api/reservations/{id}/cancel` | Authenticated | Cancel upcoming reservation and trigger automated slot release. |

### Charging Sessions (`/api/charging-sessions`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/charging-sessions/start` | Authenticated | Start charging session via ACID `start_charging` stored procedure. |
| `GET` | `/api/charging-sessions/active` | Authenticated | Get current live session with simulated telemetry (amperes, kW, SoC). |
| `GET` | `/api/charging-sessions` | Authenticated | Retrieve complete user charging session log. |
| `GET` | `/api/charging-sessions/{id}` | Authenticated | Get session metrics and billing status. |
| `POST` | `/api/charging-sessions/{id}/stop` | Authenticated | Conclude session via ACID `end_charging` procedure. |
| `GET` | `/api/charging-sessions/{id}/readings` | Authenticated | Telemetry voltage, current, and energy consumption logs. |
| `GET` | `/api/charging-sessions/{id}/invoice` | Authenticated | Generate and retrieve itemized tax invoice. |

### Payments & Digital Wallet (`/api/payments`, `/api/wallet`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/payments` | Authenticated | Settle session balance via `process_payment` procedure (WALLET, UPI, CARD). |
| `GET` | `/api/payments` | Authenticated | Retrieve payment transaction receipts. |
| `GET` | `/api/payments/{id}` | Authenticated | Retrieve single payment receipt. |
| `GET` | `/api/payments/invoice/{sessionId}` | Authenticated | Retrieve tax invoice for session. |
| `GET` | `/api/wallet` | Authenticated | Get current prepaid balance and recent transactions. |
| `POST` | `/api/wallet/top-up` | Authenticated | Add prepaid funds using pessimistic row-level locking. |
| `GET` | `/api/wallet/transactions` | Authenticated | Complete audit ledger history of wallet credits and debits. |

### Maintenance Ticketing (`/api/maintenance`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/maintenance` | Authenticated | Retrieve maintenance tickets filtered by caller role (Operator/Technician/Admin). |
| `GET` | `/api/maintenance/{id}` | Authenticated | Retrieve ticket details and attached field service records. |
| `POST` | `/api/maintenance` | OPERATOR, ADMIN | File incident ticket for damaged or faulted charger hardware. |
| `PATCH` | `/api/maintenance/{id}` | OPERATOR, ADMIN, TECHNICIAN | Update ticket status (`OPEN`, `IN_PROGRESS`, `RESOLVED`, `CANCELLED`). |
| `POST` | `/api/maintenance/{id}/records` | TECHNICIAN, ADMIN | Append work record with repair description and cost. |

### Station Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/reviews` | Authenticated | Submit 1-5 star review (enforces unique review per driver per station). |
| `GET` | `/api/reviews/station/{stationId}` | Public | Retrieve driver reviews and average rating for a station. |
| `GET` | `/api/reviews/user` | Authenticated | Retrieve reviews authored by current user. |
| `DELETE` | `/api/reviews/{id}` | Authenticated | Delete a review (restricted to author or ADMIN). |

### Role-Tailored Dashboards (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/driver` | Authenticated | Aggregated metrics for drivers (wallet balance, monthly kWh, CO2 offset, active session). |
| `GET` | `/api/dashboard/operator` | OPERATOR, ADMIN | Station occupancy, charger utilization percentage, active tickets. |
| `GET` | `/api/dashboard/admin` | ADMIN | Network-wide executive summary (total users, energy delivered, total revenue, CO2 tons avoided). |

### Analytics & Reports (`/api/analytics`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/analytics/station-revenue` | ADMIN | Query database view `station_revenue`. |
| `GET` | `/api/analytics/charger-health` | OPERATOR, ADMIN | Query database view `charger_health`. |
| `GET` | `/api/analytics/user-history` | Authenticated | Query database view `user_charging_history`. |
| `GET` | `/api/analytics/station-report/{stationId}` | OPERATOR, ADMIN | Multi-result report via `station_report` stored procedure. |

---

## 5. Verification & Test Suite Execution

The backend includes comprehensive automated unit and integration tests covering security, JWT tokens, transaction isolation, and stored procedures:

```
-------------------------------------------------------
 T E S T S
-------------------------------------------------------
Running com.voltix.security.JwtTokenProviderTest
Tests run: 3, Failures: 0, Errors: 0, Skipped: 0
Running com.voltix.service.AuthServiceTest
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0
Running com.voltix.service.PaymentServiceTest
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
Running com.voltix.service.ReservationServiceTest
Tests run: 5, Failures: 0, Errors: 0, Skipped: 0
Running com.voltix.service.WalletServiceTest
Tests run: 4, Failures: 0, Errors: 0, Skipped: 0

Results:
Tests run: 21, Failures: 0, Errors: 0, Skipped: 0
BUILD SUCCESS
```

---

## 6. How to Run

### Option A: Local Development

#### Prerequisites
- MySQL 8.0 running locally on port 3306 with `voltix_db` schema loaded.
- JDK 21+ (`java -version`).
- Apache Maven 3.9+ (`mvn -version`).
- Node.js 18+ and npm (`node -v`).

#### 1. Start Spring Boot Backend
```bash
cd backend
mvn spring-boot:run
```
The REST API will initialize on `http://localhost:8080`.
OpenAPI Swagger UI is available at: `http://localhost:8080/swagger-ui/index.html`.
Spring Boot Actuator Health is available at: `http://localhost:8080/actuator/health`.

#### 2. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Open your browser at `http://localhost:5173`.

---

### Option B: Docker Compose Single-Command Launch

To build and run all 3 services (MySQL 8.0, Spring Boot Backend, and React Frontend) with full container networking:

```bash
docker-compose up --build
```

- **Frontend**: `http://localhost:5173`
- **Backend API**: `http://localhost:8080/api`
- **Swagger Documentation**: `http://localhost:8080/swagger-ui/index.html`
- **MySQL Database**: `localhost:3306` (`voltix_db`)
