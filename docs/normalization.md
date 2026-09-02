# VOLTIX — Database Normalization Analysis (1NF, 2NF, 3NF)

## 1. Introduction to Normalization in VOLTIX

In the **VOLTIX Urban EV Charging Network Management System**, database normalization is applied systematically to eliminate data redundancy, prevent insertion/update/deletion anomalies, and safeguard relational integrity. The database schema encompasses **20 entities**, engineered to satisfy **Third Normal Form (3NF)** while preserving high operational throughput and join efficiency.

---

## 2. First Normal Form (1NF)

### 2.1 Formal Criteria
A relation is in **First Normal Form (1NF)** if and only if:
1. Every attribute contains only **atomic (indivisible)** values.
2. There are **no repeating groups** or multivalued arrays within a single record.
3. Each column has a distinct name and consistent domain data type.
4. A distinct **Primary Key (PK)** uniquely identifies each row.

### 2.2 Unnormalized Form (UNF) Violation Examples
In an unnormalized design, an engineer might be tempted to store:
- Multiple vehicle registration numbers for a single user as a comma-separated list:
  $$\text{USER}(user\_id, name, email, \underline{vehicles: [TN-01-EV-1001, TN-01-EV-1002]})$$
- Telemetry meter readings recorded directly inside a charging session:
  $$\text{CHARGING\_SESSION}(session\_id, charger\_id, \underline{readings: [(t_1, v_1, i_1), (t_2, v_2, i_2)]})$$

### 2.3 Transformation into 1NF
In VOLTIX, 1NF is strictly enforced across all tables:
- **`VEHICLE` Table**: Decomposed into its own atomic table where each row contains exactly one vehicle registration plate, linked back to `user_id` via a Foreign Key:
  $$\text{VEHICLE}(\underline{vehicle\_id}, user\_id, model\_id, registration\_number, battery\_percentage)$$
- **`METER_READING` Table**: Every telemetry sample is stored as an individual row with atomic scalar columns (`voltage`, `current`, `energy_kwh`):
  $$\text{METER\_READING}(\underline{reading\_id}, session\_id, reading\_time, voltage, current, energy\_kwh)$$
- **`USER` Table**: All contact details (`email`, `phone`) are stored as single atomic strings with strict `UNIQUE` constraints.

---

## 3. Second Normal Form (2NF)

### 3.1 Formal Criteria
A relation is in **Second Normal Form (2NF)** if and only if:
1. It is already in **1NF**.
2. There are **no partial functional dependencies**; that is, every non-prime attribute must be **fully functionally dependent** on the **entire Primary Key**, rather than a subset of a composite key.

$$\forall X \rightarrow Y, \text{ if } X \subset PK \text{ and } Y \notin PK \implies \text{Violation of 2NF}$$

### 3.2 2NF Analysis in VOLTIX

#### Case A: User Promotional Redemptions (`USER_PROMOTION`)
Consider tracking user coupon redemptions. If promotional details were embedded alongside user redemption logs under a composite primary key:
$$\text{USER\_COUPON}(\underline{user\_id, code}, used\_at, discount\_type, discount\_value, start\_date, end\_date)$$

- **Composite Primary Key**: `(user_id, code)`
- **Functional Dependencies**:
  - `(user_id, code) -> used_at` (Full key dependency)
  - `code -> discount_type, discount_value, start_date, end_date` (**Partial Key Dependency** — depends only on `code`, independent of `user_id`!)

**2NF Resolution:**
Split the relation into two distinct entities:
1. **`PROMOTION`**: Fully dependent on `promotion_id`:
   $$\text{PROMOTION}(\underline{promotion\_id}, code, discount\_type, discount\_value, start\_date, end\_date, usage\_limit)$$
2. **`USER_PROMOTION`**: Associative table where `used_at` depends on the full composite key `(user_id, promotion_id)`:
   $$\text{USER\_PROMOTION}(\underline{user\_id, promotion\_id}, used\_at)$$

#### Case B: Charger Identification and Hardware Capabilities
If chargers were identified by `(station_id, charger_number)` and stored connector ratings directly:
$$\text{CHARGER}(\underline{station\_id, charger\_number}, status, connector\_type, power\_rating)$$
Here, `connector_type -> power_rating` represents hardware characteristics independent of the physical installation location `station_id`.
By introducing surrogate primary keys and abstracting connector specifications into `CHARGER_TYPE`, partial dependencies on installation locations are eliminated.

---

## 4. Third Normal Form (3NF)

### 4.1 Formal Criteria
A relation is in **Third Normal Form (3NF)** if and only if:
1. It is already in **2NF**.
2. There are **no transitive dependencies**; that is, no non-prime attribute is functionally dependent on another non-prime attribute:
   $$X \rightarrow Y \text{ and } Y \rightarrow Z \implies X \rightarrow Z \quad (\text{Violation if } X \text{ is PK and } Y, Z \text{ are non-prime})$$

### 4.2 Key 3NF Decompositions in VOLTIX

#### 1. Vehicle Model Decoupling (`VEHICLE` vs `VEHICLE_MODEL`)
- **Unnormalized Anti-Pattern**:
  $$\text{VEHICLE}(\underline{vehicle\_id}, user\_id, registration\_number, model\_name, manufacturer, battery\_capacity, max\_charging\_power)$$
- **Transitive Dependency Chain**:
  $$\text{vehicle\_id} \rightarrow \text{model\_name} \rightarrow (\text{manufacturer, battery\_capacity, max\_charging\_power})$$
  Every time a user registers a Tata Nexon EV, the manufacturer, pack size (40.5 kWh), and charging limit (50 kW) would be duplicated. If Tata updates technical specs, updating multiple rows introduces update anomalies.
- **3NF Decomposition**:
  $$\text{VEHICLE\_MODEL}(\underline{model\_id}, manufacturer, model\_name, battery\_capacity, max\_charging\_power)$$
  $$\text{VEHICLE}(\underline{vehicle\_id}, user\_id, model\_id, registration\_number, battery\_percentage)$$
  Now, `VEHICLE` stores only `model_id` (FK), and non-prime attributes depend solely on `vehicle_id`.

#### 2. Geographic Station Decoupling (`CHARGING_STATION` vs `CITY`)
- **Unnormalized Anti-Pattern**:
  $$\text{CHARGING\_STATION}(\underline{station\_id}, station\_name, address, city\_name, state, latitude, longitude)$$
- **Transitive Dependency Chain**:
  $$\text{station\_id} \rightarrow \text{city\_name} \rightarrow \text{state}$$
  The state (e.g. 'Tamil Nadu') is functionally determined by `city_name` (e.g. 'Chennai'), not directly by `station_id`.
- **3NF Decomposition**:
  $$\text{CITY}(\underline{city\_id}, city\_name, state)$$
  $$\text{CHARGING\_STATION}(\underline{station\_id}, city\_id, operator\_id, station\_name, latitude, longitude, address, status)$$
  Eliminates redundant storage of state names and prevents deletion anomalies (deleting the last station in Coimbatore will not purge Coimbatore from the database).

#### 3. Charger Hardware Specifications (`CHARGER` vs `CHARGER_TYPE`)
- **Unnormalized Anti-Pattern**:
  $$\text{CHARGER}(\underline{charger\_id}, station\_id, charger\_number, connector\_type, power\_rating, status)$$
- **Transitive Dependency Chain**:
  $$\text{charger\_id} \rightarrow \text{connector\_type} \rightarrow \text{power\_rating}$$
- **3NF Decomposition**:
  $$\text{CHARGER\_TYPE}(\underline{charger\_type\_id}, connector\_type, power\_rating)$$
  $$\text{CHARGER}(\underline{charger\_id}, station\_id, charger\_type_id, charger\_number, status)$$

#### 4. Dynamic Time-of-Use Tariffs (`PRICING_PLAN` vs `PRICING_RULE`)
- Tariff rates vary based on plan type (PEAK, OFF_PEAK, STANDARD), day type (WEEKDAY, WEEKEND), and time bands. Storing prices inside `CHARGER` or `STATION` would create severe transitive dependencies and anomalies.
- **3NF Decomposition**:
  $$\text{PRICING\_PLAN}(\underline{plan\_id}, plan\_name)$$
  $$\text{PRICING\_RULE}(\underline{rule\_id}, plan\_id, start\_time, end\_time, day\_type, price\_per\_kwh, idle\_fee)$$

#### 5. Planned vs Actual Utilization Separation (`RESERVATION` vs `CHARGING_SESSION`)
- **Architectural Rationale**: A reservation represents an intent to charge within a scheduled window $[T_{start}, T_{end}]$. A charging session represents physical power delivery $[t_{start}, t_{end}, kWh, cost]$.
- A user might reserve a charger but fail to arrive (EXPIRED or CANCELLED booking). Storing charging session metrics inside `RESERVATION` would require nullable non-prime columns, violating strict domain constraints.
- Decomposing into `RESERVATION` (1:1 optional) `CHARGING_SESSION` ensures both entities maintain functional dependency strictly on their own identity.

---

## 5. Summary Table of Normal Forms

| Table Name | Primary Key (PK) | Normal Form Achieved | Justification & Dependencies |
| :--- | :--- | :---: | :--- |
| `user` | `user_id` | **3NF** | All attributes depend directly on `user_id`. No transitive links. |
| `city` | `city_id` | **3NF** | Atomic city and state definitions. `uq_city_state` unique key. |
| `vehicle_model` | `model_id` | **3NF** | Technical OEM specifications isolated from physical units. |
| `charger_type` | `charger_type_id` | **3NF** | Electrical hardware parameters abstracted from physical guns. |
| `pricing_plan` | `plan_id` | **3NF** | Plan taxonomy isolated from time-of-day tariffs. |
| `promotion` | `promotion_id` | **3NF** | Coupon discounts and terms isolated from redemptions. |
| `vehicle` | `vehicle_id` | **3NF** | FK to `user` and `vehicle_model`. No duplicate OEM attributes. |
| `charging_station` | `station_id` | **3NF** | FK to `city` and `user` (operator). Geographic isolation. |
| `charger` | `charger_id` | **3NF** | FK to `charging_station` and `charger_type`. Pure unit status. |
| `reservation` | `reservation_id` | **3NF** | Temporal booking schedule; zero actual telemetry attributes. |
| `charging_session` | `session_id` | **3NF** | Actual runtime execution; FK to `reservation`, `charger`, `vehicle`. |
| `meter_reading` | `reading_id` | **3NF** | Periodic time-series samples dependent strictly on `reading_id`. |
| `pricing_rule` | `rule_id` | **3NF** | Time band & day-type rules referencing `plan_id`. |
| `payment` | `payment_id` | **3NF** | 1:1 financial settlement record linked to `session_id`. |
| `wallet` | `wallet_id` | **3NF** | 1:1 prepaid balance ledger tied to `user_id`. |
| `wallet_transaction`| `transaction_id` | **3NF** | Immutable historical audit ledger linked to `wallet_id`. |
| `maintenance_request`| `request_id` | **3NF** | Incident ticket metadata linked to `charger_id` and technician. |
| `maintenance_record`| `maintenance_id`| **3NF** | Resolution work order and cost breakdown linked to request. |
| `review` | `review_id` | **3NF** | Customer feedback tied to `user_id` and `station_id`. |
| `user_promotion` | `(user_id, promotion_id)` | **3NF** | Associative table; `used_at` fully depends on composite key. |

---

## 6. Conclusion
The VOLTIX relational schema achieves an optimal balance of **3NF normalization**, eliminating update anomalies and data duplication while maintaining performance through foreign key indexing and denormalized SQL views.
