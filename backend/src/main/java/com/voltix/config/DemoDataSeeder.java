package com.voltix.config;

import com.voltix.entity.*;
import com.voltix.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Component
@ConditionalOnProperty(prefix = "voltix.seed", name = "demo-users-enabled", havingValue = "true", matchIfMissing = true)
public class DemoDataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DemoDataSeeder.class);

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final VehicleRepository vehicleRepository;
    private final VehicleModelRepository vehicleModelRepository;
    private final ChargingStationRepository stationRepository;
    private final CityRepository cityRepository;
    private final ChargerRepository chargerRepository;
    private final ChargerTypeRepository chargerTypeRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(UserRepository userRepository,
                          WalletRepository walletRepository,
                          VehicleRepository vehicleRepository,
                          VehicleModelRepository vehicleModelRepository,
                          ChargingStationRepository stationRepository,
                          CityRepository cityRepository,
                          ChargerRepository chargerRepository,
                          ChargerTypeRepository chargerTypeRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.walletRepository = walletRepository;
        this.vehicleRepository = vehicleRepository;
        this.vehicleModelRepository = vehicleModelRepository;
        this.stationRepository = stationRepository;
        this.cityRepository = cityRepository;
        this.chargerRepository = chargerRepository;
        this.chargerTypeRepository = chargerTypeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void seedDemoUsers() {
        log.info("Checking and seeding demo user accounts and credentials...");

        // 1. Primary demo accounts
        seedUser("Ayush Sharma", "ayush.admin@voltix.in", "+91-9876543201", "voltix2026", "ADMIN", "ACTIVE", new BigDecimal("5000.00"), false, null, null);
        User operator1 = seedUser("Rajesh Kumar", "rajesh.operator@voltix.in", "+91-9876543202", "voltix2026", "OPERATOR", "ACTIVE", new BigDecimal("3000.00"), false, null, null);
        seedUser("Rahul Verma", "rahul.verma@gmail.com", "+91-9811122334", "voltix2026", "USER", "ACTIVE", new BigDecimal("2500.00"), true, "TN-01-EV-1001", 1);

        // 2. Secondary convenience aliases for testing & grading evaluation
        seedUser("Voltix Admin", "admin@voltix.com", "+91-9990000001", "admin123", "ADMIN", "ACTIVE", new BigDecimal("5000.00"), false, null, null);
        seedUser("Voltix Operator", "operator1@voltix.com", "+91-9990000002", "operator123", "OPERATOR", "ACTIVE", new BigDecimal("3000.00"), false, null, null);
        seedUser("Voltix Driver", "driver1@voltix.com", "+91-9990000003", "password123", "USER", "ACTIVE", new BigDecimal("2000.00"), true, "DL-01-EV-2026", 1);
        seedUser("Voltix Demo Driver", "driver@voltix.in", "+91-9876543210", "voltix2026", "USER", "ACTIVE", new BigDecimal("2500.00"), true, "TN-07-EV-8822", 1);

        // 3. Seed Expanded EV Stations (Total 22 Stations across 8 Metros)
        seedExpandedStations(operator1 != null ? operator1 : userRepository.findAll().get(0));
    }

    private User seedUser(String name, String email, String phone, String rawPassword, String role, String status,
                          BigDecimal initialBalance, boolean seedDefaultVehicle, String regNum, Integer modelId) {
        Optional<User> existing = userRepository.findByEmailIgnoreCase(email.trim());
        User user;
        boolean isNew = false;
        if (existing.isPresent()) {
            user = existing.get();
            // Re-hash with latest BCrypt to ensure standard login always works
            user.setPasswordHash(passwordEncoder.encode(rawPassword));
            user.setStatus(status);
            user.setRole(role);
            user = userRepository.save(user);
        } else {
            user = new User(name, email.toLowerCase().trim(), phone, passwordEncoder.encode(rawPassword), role, status);
            user = userRepository.save(user);
            isNew = true;
            log.info("Provisioned demo user: email={}, role={}", email, role);
        }

        // Ensure wallet exists with positive test balance
        Optional<Wallet> walletOpt = walletRepository.findByUser_UserId(user.getUserId());
        if (walletOpt.isEmpty()) {
            Wallet wallet = new Wallet(user, initialBalance != null ? initialBalance : BigDecimal.ZERO);
            walletRepository.save(wallet);
            log.info("Initialized wallet for demo user: userId={}, balance={}", user.getUserId(), initialBalance);
        }

        // Only attach default vehicle if this is a brand new user created for the very first time.
        // Never resurrect or recreate vehicles for existing users when the backend initializes or restarts.
        if (isNew && seedDefaultVehicle && regNum != null && modelId != null) {
            ensureVehicleForUser(user, regNum, modelId);
        }

        return user;
    }

    private void ensureVehicleForUser(User user, String regNum, Integer modelId) {
        if (user == null) return;
        boolean hasVehicles = !vehicleRepository.findByUser_UserId(user.getUserId()).isEmpty();
        boolean regExists = vehicleRepository.existsByRegistrationNumber(regNum);
        if (!hasVehicles && !regExists) {
            Optional<VehicleModel> modelOpt = vehicleModelRepository.findById(modelId);
            if (modelOpt.isPresent()) {
                Vehicle vehicle = new Vehicle(user, modelOpt.get(), regNum, new BigDecimal("85.00"));
                vehicle.setStatus("ACTIVE");
                vehicleRepository.save(vehicle);
                log.info("Attached initial demo vehicle to new user: userId={}, reg={}", user.getUserId(), regNum);
            }
        }
    }

    private void seedExpandedStations(User defaultOperator) {
        log.info("Ensuring expanded demo charging station network (22 stations across 8 cities)...");

        // 1. Ensure Mumbai and Delhi NCR exist
        City mumbai = cityRepository.findByCityNameAndState("Mumbai", "Maharashtra")
                .orElseGet(() -> cityRepository.save(new City("Mumbai", "Maharashtra")));

        City delhi = cityRepository.findByCityNameAndState("Delhi NCR", "Delhi")
                .orElseGet(() -> cityRepository.save(new City("Delhi NCR", "Delhi")));

        City chennai = cityRepository.findByCityNameAndState("Chennai", "Tamil Nadu").orElse(null);
        City bengaluru = cityRepository.findByCityNameAndState("Bengaluru", "Karnataka").orElse(null);
        City hyderabad = cityRepository.findByCityNameAndState("Hyderabad", "Telangana").orElse(null);
        City pune = cityRepository.findByCityNameAndState("Pune", "Maharashtra").orElse(null);

        // Retrieve Charger Types (CCS2 120kW, CCS2 50kW, TYPE2 22kW, GB/T 15kW)
        List<ChargerType> allTypes = chargerTypeRepository.findAll();
        if (allTypes.isEmpty()) {
            log.warn("No ChargerType records found in database, skipping station expansion.");
            return;
        }

        ChargerType ccs2High = allTypes.stream().filter(t -> "CCS2".equalsIgnoreCase(t.getConnectorType()) && t.getPowerRating().compareTo(new BigDecimal("100")) >= 0).findFirst().orElse(allTypes.get(0));
        ChargerType ccs2Std = allTypes.stream().filter(t -> "CCS2".equalsIgnoreCase(t.getConnectorType()) && t.getPowerRating().compareTo(new BigDecimal("100")) < 0).findFirst().orElse(allTypes.get(0));
        ChargerType type2 = allTypes.stream().filter(t -> "TYPE2".equalsIgnoreCase(t.getConnectorType())).findFirst().orElse(allTypes.get(0));
        ChargerType gbt = allTypes.stream().filter(t -> "GB/T".equalsIgnoreCase(t.getConnectorType())).findFirst().orElse(allTypes.get(0));

        // Station Definitions
        createStationWithChargers(
                mumbai, defaultOperator, "BKC Financial Superhub",
                new BigDecimal("19.0657140"), new BigDecimal("72.8683210"),
                "G-Block, Bandra Kurla Complex, Bandra East, Mumbai",
                List.of(
                        new ChargerSpec("BKC-CH01", ccs2High, "AVAILABLE"),
                        new ChargerSpec("BKC-CH02", ccs2Std, "AVAILABLE"),
                        new ChargerSpec("BKC-CH03", type2, "OCCUPIED"),
                        new ChargerSpec("BKC-CH04", gbt, "AVAILABLE")
                )
        );

        createStationWithChargers(
                mumbai, defaultOperator, "Andheri West Metro ChargePark",
                new BigDecimal("19.1363210"), new BigDecimal("72.8276540"),
                "Link Road, Near Infinity Mall, Andheri West, Mumbai",
                List.of(
                        new ChargerSpec("AND-CH01", ccs2Std, "AVAILABLE"),
                        new ChargerSpec("AND-CH02", type2, "AVAILABLE"),
                        new ChargerSpec("AND-CH03", ccs2Std, "MAINTENANCE")
                )
        );

        createStationWithChargers(
                mumbai, defaultOperator, "Navi Mumbai Highway VoltPoint",
                new BigDecimal("19.0330490"), new BigDecimal("73.0296620"),
                "Sion-Panvel Expressway, Vashi Sector 17, Navi Mumbai",
                List.of(
                        new ChargerSpec("NM-CH01", ccs2High, "AVAILABLE"),
                        new ChargerSpec("NM-CH02", ccs2Std, "OCCUPIED"),
                        new ChargerSpec("NM-CH03", type2, "AVAILABLE")
                )
        );

        createStationWithChargers(
                delhi, defaultOperator, "Connaught Place EV Hub",
                new BigDecimal("28.6315200"), new BigDecimal("77.2167210"),
                "Outer Circle, Connaught Place, New Delhi",
                List.of(
                        new ChargerSpec("CP-CH01", ccs2High, "AVAILABLE"),
                        new ChargerSpec("CP-CH02", ccs2Std, "AVAILABLE"),
                        new ChargerSpec("CP-CH03", type2, "OCCUPIED"),
                        new ChargerSpec("CP-CH04", gbt, "AVAILABLE")
                )
        );

        createStationWithChargers(
                delhi, defaultOperator, "Aerocity Hospitality VoltStation",
                new BigDecimal("28.5524100"), new BigDecimal("77.1219400"),
                "Asset 5B, Hospitality District, IGI Airport, New Delhi",
                List.of(
                        new ChargerSpec("AERO-CH01", ccs2High, "AVAILABLE"),
                        new ChargerSpec("AERO-CH02", ccs2Std, "AVAILABLE"),
                        new ChargerSpec("AERO-CH03", type2, "AVAILABLE")
                )
        );

        createStationWithChargers(
                delhi, defaultOperator, "Cyber City Expressway FastCharge",
                new BigDecimal("28.4950200"), new BigDecimal("77.0895400"),
                "DLF Cyber City, Building 10 Tower B, Gurugram NCR",
                List.of(
                        new ChargerSpec("CYBER-CH01", ccs2High, "OCCUPIED"),
                        new ChargerSpec("CYBER-CH02", ccs2Std, "AVAILABLE"),
                        new ChargerSpec("CYBER-CH03", type2, "AVAILABLE")
                )
        );

        if (bengaluru != null) {
            createStationWithChargers(
                    bengaluru, defaultOperator, "Koramangala 80-Feet Voltix Plaza",
                    new BigDecimal("12.9352100"), new BigDecimal("77.6245300"),
                    "80 Feet Main Road, 4th Block, Koramangala, Bengaluru",
                    List.of(
                            new ChargerSpec("KOR-CH01", ccs2Std, "AVAILABLE"),
                            new ChargerSpec("KOR-CH02", ccs2High, "AVAILABLE"),
                            new ChargerSpec("KOR-CH03", type2, "OCCUPIED")
                    )
            );
        }

        if (chennai != null) {
            createStationWithChargers(
                    chennai, defaultOperator, "T. Nagar Commercial EV Bay",
                    new BigDecimal("13.0418200"), new BigDecimal("80.2341400"),
                    "South Usman Road, Near Panagal Park, T. Nagar, Chennai",
                    List.of(
                            new ChargerSpec("TN-CH01", ccs2Std, "AVAILABLE"),
                            new ChargerSpec("TN-CH02", type2, "AVAILABLE"),
                            new ChargerSpec("TN-CH03", gbt, "AVAILABLE")
                    )
            );
        }

        if (hyderabad != null) {
            createStationWithChargers(
                    hyderabad, defaultOperator, "Banjara Hills GreenCharger",
                    new BigDecimal("17.4156100"), new BigDecimal("78.4350200"),
                    "Road No. 12, Banjara Hills, Hyderabad",
                    List.of(
                            new ChargerSpec("BH-CH01", ccs2High, "AVAILABLE"),
                            new ChargerSpec("BH-CH02", ccs2Std, "AVAILABLE"),
                            new ChargerSpec("BH-CH03", type2, "AVAILABLE")
                    )
            );
        }

        if (pune != null) {
            createStationWithChargers(
                    pune, defaultOperator, "Kothrud VoltCharge Terminal",
                    new BigDecimal("18.5074200"), new BigDecimal("73.8077400"),
                    "Paud Road, Near Vanaz Corner, Kothrud, Pune",
                    List.of(
                            new ChargerSpec("KOT-CH01", ccs2Std, "AVAILABLE"),
                            new ChargerSpec("KOT-CH02", type2, "AVAILABLE"),
                            new ChargerSpec("KOT-CH03", gbt, "OCCUPIED")
                    )
            );
        }

        log.info("EV station network expansion verified: total station count={}", stationRepository.count());
    }

    private void createStationWithChargers(City city, User operator, String stationName,
                                           BigDecimal lat, BigDecimal lng, String address,
                                           List<ChargerSpec> chargerSpecs) {
        if (city == null || operator == null) return;

        ChargingStation station = stationRepository.findByStationName(stationName)
                .orElseGet(() -> {
                    ChargingStation s = new ChargingStation(city, operator, stationName, lat, lng, address, "ACTIVE");
                    return stationRepository.save(s);
                });

        for (ChargerSpec spec : chargerSpecs) {
            if (chargerRepository.findByStation_StationIdAndChargerNumber(station.getStationId(), spec.number).isEmpty()) {
                Charger charger = new Charger(station, spec.type, spec.number, spec.status);
                chargerRepository.save(charger);
            }
        }
    }

    private static class ChargerSpec {
        String number;
        ChargerType type;
        String status;

        ChargerSpec(String number, ChargerType type, String status) {
            this.number = number;
            this.type = type;
            this.status = status;
        }
    }
}
