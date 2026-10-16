// ============================================================================
// VOLTIX: Urban EV Charging Network Management System
// File: dataStore.js
// Description: Reactive client-side persistence repository ensuring all user
//              and application data is state-driven with real zero/empty states.
// ============================================================================

const STORAGE_KEYS = {
  USERS: 'voltix_users',
  ACTIVE_USER: 'voltix_auth_user',
  VEHICLES: 'voltix_vehicles',
  WALLETS: 'voltix_wallets',
  RESERVATIONS: 'voltix_reservations',
  SESSIONS: 'voltix_sessions',
  PAYMENTS: 'voltix_payments',
  STATIONS: 'voltix_stations',
};

// Initial physical station infrastructure catalog (matching database entities)
const INITIAL_STATIONS = [
  {
    stationId: 1,
    cityId: 1,
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    stationName: 'Voltix Superhub OMR',
    address: 'Plot 12, Rajiv Gandhi Salai, Thoraipakkam, Chennai',
    latitude: 12.9715987,
    longitude: 80.2437829,
    distanceKm: 2.4,
    status: 'ACTIVE',
    basePricePerKwh: 14.0,
    operatingHours: '24/7 Open',
    amenities: ['Cafeteria', 'Restrooms', 'Free Wi-Fi', 'Security Guard', 'Covered Canopy'],
    chargers: [
      { chargerId: 1, chargerNumber: 'OMR-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 17.5 },
      { chargerId: 2, chargerNumber: 'OMR-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 14.0 },
      { chargerId: 3, chargerNumber: 'OMR-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 11.5 },
      { chargerId: 4, chargerNumber: 'OMR-CH04', connectorType: 'GB/T', powerKw: 15, pricePerKwh: 10.5 },
    ],
  },
  {
    stationId: 2,
    cityId: 1,
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    stationName: 'Anna Nagar EV Plaza',
    address: '2nd Avenue, Anna Nagar Roundtana, Chennai',
    latitude: 13.0850392,
    longitude: 80.2101372,
    distanceKm: 5.1,
    status: 'ACTIVE',
    basePricePerKwh: 14.0,
    operatingHours: '06:00 AM - 11:00 PM',
    amenities: ['Shopping Mall', 'Restrooms', 'Food Court'],
    chargers: [
      { chargerId: 5, chargerNumber: 'AN-CH01', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 14.0 },
      { chargerId: 6, chargerNumber: 'AN-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 14.0 },
      { chargerId: 7, chargerNumber: 'AN-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 12.0 },
    ],
  },
  {
    stationId: 3,
    cityId: 1,
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    stationName: 'Guindy Industrial FastCharge',
    address: 'CIPET Road, Guindy Industrial Estate, Chennai',
    latitude: 13.0066721,
    longitude: 80.2025372,
    distanceKm: 7.8,
    status: 'ACTIVE',
    basePricePerKwh: 13.5,
    operatingHours: '24/7 Open',
    amenities: ['Coffee Vending', 'Waiting Lounge'],
    chargers: [
      { chargerId: 8, chargerNumber: 'GD-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 18.0 },
      { chargerId: 9, chargerNumber: 'GD-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 14.0 },
      { chargerId: 10, chargerNumber: 'GD-CH03', connectorType: 'CHAdeMO', powerKw: 50, pricePerKwh: 14.0 },
    ],
  },
  {
    stationId: 4,
    cityId: 2,
    cityName: 'Bengaluru',
    state: 'Karnataka',
    stationName: 'Indiranagar VoltStation',
    address: '100 Feet Road, HAL 2nd Stage, Indiranagar, Bengaluru',
    latitude: 12.9783692,
    longitude: 77.6408356,
    distanceKm: 3.2,
    status: 'ACTIVE',
    basePricePerKwh: 15.0,
    operatingHours: '24/7 Open',
    amenities: ['Artisan Cafe', 'Wi-Fi Lounge', 'Restrooms'],
    chargers: [
      { chargerId: 11, chargerNumber: 'IN-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 19.5 },
      { chargerId: 12, chargerNumber: 'IN-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 15.0 },
      { chargerId: 13, chargerNumber: 'IN-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 12.0 },
    ],
  },
  {
    stationId: 5,
    cityId: 2,
    cityName: 'Bengaluru',
    state: 'Karnataka',
    stationName: 'Electronic City Hub',
    address: 'Phase 1, Hosur Road, Electronic City, Bengaluru',
    latitude: 12.8452145,
    longitude: 77.6601684,
    distanceKm: 14.0,
    status: 'ACTIVE',
    basePricePerKwh: 14.5,
    operatingHours: '24/7 Open',
    amenities: ['Food Court', 'ATM', 'Convenience Store'],
    chargers: [
      { chargerId: 14, chargerNumber: 'EC-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 18.5 },
      { chargerId: 15, chargerNumber: 'EC-CH02', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 18.5 },
      { chargerId: 16, chargerNumber: 'EC-CH03', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 14.5 },
      { chargerId: 17, chargerNumber: 'EC-CH04', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 11.5 },
    ],
  },
  {
    stationId: 7,
    cityId: 3,
    cityName: 'Vellore',
    state: 'Tamil Nadu',
    stationName: 'VIT Campus VoltPoint',
    address: 'Near Main Gate, VIT University, Katpadi, Vellore',
    latitude: 12.9692471,
    longitude: 79.1559384,
    distanceKm: 1.5,
    status: 'ACTIVE',
    basePricePerKwh: 13.0,
    operatingHours: '24/7 Open',
    amenities: ['Campus Canteen', 'EV Two-Wheeler Priority Bays', 'Student Lounge'],
    chargers: [
      { chargerId: 21, chargerNumber: 'VIT-CH01', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 13.0 },
      { chargerId: 22, chargerNumber: 'VIT-CH02', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 11.0 },
      { chargerId: 23, chargerNumber: 'VIT-CH03', connectorType: 'GB/T', powerKw: 15, pricePerKwh: 9.5 },
    ],
  },
  {
    stationId: 9,
    cityId: 4,
    cityName: 'Hyderabad',
    state: 'Telangana',
    stationName: 'Hitec City UltraCharger',
    address: 'Cyber Towers Quad, Madhapur, Hitec City, Hyderabad',
    latitude: 17.4435123,
    longitude: 78.3772341,
    distanceKm: 4.8,
    status: 'ACTIVE',
    basePricePerKwh: 16.0,
    operatingHours: '24/7 Open',
    amenities: ['Drive-in Cafe', 'Executive Lounge', 'Restrooms'],
    chargers: [
      { chargerId: 26, chargerNumber: 'HC-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 19.0 },
      { chargerId: 27, chargerNumber: 'HC-CH02', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 19.0 },
      { chargerId: 28, chargerNumber: 'HC-CH03', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 15.0 },
    ],
  },
  {
    stationId: 12,
    cityId: 6,
    cityName: 'Pune',
    state: 'Maharashtra',
    stationName: 'Hinjewadi Infotech ChargePark',
    address: 'Phase 1, Rajiv Gandhi Infotech Park, Hinjewadi, Pune',
    latitude: 18.5912781,
    longitude: 73.7389145,
    distanceKm: 6.2,
    status: 'ACTIVE',
    basePricePerKwh: 14.5,
    operatingHours: '24/7 Open',
    amenities: ['Tech Park Cafeteria', 'Restrooms', 'ATM'],
    chargers: [
      { chargerId: 34, chargerNumber: 'HJ-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 18.0 },
      { chargerId: 35, chargerNumber: 'HJ-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 14.5 },
      { chargerId: 36, chargerNumber: 'HJ-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 11.5 },
    ],
  },
  {
    stationId: 13,
    cityId: 7,
    cityName: 'Mumbai',
    state: 'Maharashtra',
    stationName: 'BKC Financial Superhub',
    address: 'G-Block, Bandra Kurla Complex, Bandra East, Mumbai',
    latitude: 19.0657140,
    longitude: 72.8683210,
    distanceKm: 1.8,
    status: 'ACTIVE',
    basePricePerKwh: 16.5,
    operatingHours: '24/7 Open',
    amenities: ['Business Lounge', 'Cafeteria', 'Valet Parking', 'High-Speed Wi-Fi'],
    chargers: [
      { chargerId: 37, chargerNumber: 'BKC-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 19.5, status: 'AVAILABLE' },
      { chargerId: 38, chargerNumber: 'BKC-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 16.5, status: 'AVAILABLE' },
      { chargerId: 39, chargerNumber: 'BKC-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 13.0, status: 'OCCUPIED' },
      { chargerId: 40, chargerNumber: 'BKC-CH04', connectorType: 'GB/T', powerKw: 15, pricePerKwh: 11.5, status: 'AVAILABLE' },
    ],
  },
  {
    stationId: 14,
    cityId: 7,
    cityName: 'Mumbai',
    state: 'Maharashtra',
    stationName: 'Andheri West Metro ChargePark',
    address: 'Link Road, Near Infinity Mall, Andheri West, Mumbai',
    latitude: 19.1363210,
    longitude: 72.8276540,
    distanceKm: 4.2,
    status: 'ACTIVE',
    basePricePerKwh: 15.5,
    operatingHours: '06:00 AM - 11:30 PM',
    amenities: ['Shopping Mall', 'Restrooms', 'Food Court'],
    chargers: [
      { chargerId: 41, chargerNumber: 'AND-CH01', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 15.5, status: 'AVAILABLE' },
      { chargerId: 42, chargerNumber: 'AND-CH02', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 12.5, status: 'AVAILABLE' },
      { chargerId: 43, chargerNumber: 'AND-CH03', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 15.5, status: 'MAINTENANCE' },
    ],
  },
  {
    stationId: 15,
    cityId: 7,
    cityName: 'Mumbai',
    state: 'Maharashtra',
    stationName: 'Navi Mumbai Highway VoltPoint',
    address: 'Sion-Panvel Expressway, Vashi Sector 17, Navi Mumbai',
    latitude: 19.0330490,
    longitude: 73.0296620,
    distanceKm: 6.9,
    status: 'ACTIVE',
    basePricePerKwh: 15.0,
    operatingHours: '24/7 Open',
    amenities: ['Highway Diner', 'Restrooms', 'Convenience Store'],
    chargers: [
      { chargerId: 44, chargerNumber: 'NM-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 18.5, status: 'AVAILABLE' },
      { chargerId: 45, chargerNumber: 'NM-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 15.0, status: 'OCCUPIED' },
      { chargerId: 46, chargerNumber: 'NM-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 12.0, status: 'AVAILABLE' },
    ],
  },
  {
    stationId: 16,
    cityId: 8,
    cityName: 'Delhi NCR',
    state: 'Delhi',
    stationName: 'Connaught Place EV Hub',
    address: 'Outer Circle, Connaught Place, New Delhi',
    latitude: 28.6315200,
    longitude: 77.2167210,
    distanceKm: 2.1,
    status: 'ACTIVE',
    basePricePerKwh: 16.0,
    operatingHours: '24/7 Open',
    amenities: ['Metro Walkway', 'Restaurants', 'Underground Parking'],
    chargers: [
      { chargerId: 47, chargerNumber: 'CP-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 19.0, status: 'AVAILABLE' },
      { chargerId: 48, chargerNumber: 'CP-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 16.0, status: 'AVAILABLE' },
      { chargerId: 49, chargerNumber: 'CP-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 12.5, status: 'OCCUPIED' },
      { chargerId: 50, chargerNumber: 'CP-CH04', connectorType: 'GB/T', powerKw: 15, pricePerKwh: 11.0, status: 'AVAILABLE' },
    ],
  },
  {
    stationId: 17,
    cityId: 8,
    cityName: 'Delhi NCR',
    state: 'Delhi',
    stationName: 'Aerocity Hospitality VoltStation',
    address: 'Asset 5B, Hospitality District, IGI Airport, New Delhi',
    latitude: 28.5524100,
    longitude: 77.1219400,
    distanceKm: 3.5,
    status: 'ACTIVE',
    basePricePerKwh: 17.0,
    operatingHours: '24/7 Open',
    amenities: ['Hotel District', 'Executive Lounge', 'Free Wi-Fi'],
    chargers: [
      { chargerId: 51, chargerNumber: 'AERO-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 20.0, status: 'AVAILABLE' },
      { chargerId: 52, chargerNumber: 'AERO-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 17.0, status: 'AVAILABLE' },
      { chargerId: 53, chargerNumber: 'AERO-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 13.5, status: 'AVAILABLE' },
    ],
  },
  {
    stationId: 18,
    cityId: 8,
    cityName: 'Delhi NCR',
    state: 'Delhi',
    stationName: 'Cyber City Expressway FastCharge',
    address: 'DLF Cyber City, Building 10 Tower B, Gurugram NCR',
    latitude: 28.4950200,
    longitude: 77.0895400,
    distanceKm: 5.4,
    status: 'ACTIVE',
    basePricePerKwh: 16.5,
    operatingHours: '24/7 Open',
    amenities: ['Cyber Hub Food Court', 'Security Guard', 'Covered Bay'],
    chargers: [
      { chargerId: 54, chargerNumber: 'CYBER-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 19.5, status: 'OCCUPIED' },
      { chargerId: 55, chargerNumber: 'CYBER-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 16.5, status: 'AVAILABLE' },
      { chargerId: 56, chargerNumber: 'CYBER-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 13.0, status: 'AVAILABLE' },
    ],
  },
  {
    stationId: 19,
    cityId: 2,
    cityName: 'Bengaluru',
    state: 'Karnataka',
    stationName: 'Koramangala 80-Feet Voltix Plaza',
    address: '80 Feet Main Road, 4th Block, Koramangala, Bengaluru',
    latitude: 12.9352100,
    longitude: 77.6245300,
    distanceKm: 2.8,
    status: 'ACTIVE',
    basePricePerKwh: 15.0,
    operatingHours: '24/7 Open',
    amenities: ['Artisan Bakery', 'EV Accessories Store'],
    chargers: [
      { chargerId: 57, chargerNumber: 'KOR-CH01', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 15.0, status: 'AVAILABLE' },
      { chargerId: 58, chargerNumber: 'KOR-CH02', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 18.5, status: 'AVAILABLE' },
      { chargerId: 59, chargerNumber: 'KOR-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 12.0, status: 'OCCUPIED' },
    ],
  },
  {
    stationId: 20,
    cityId: 1,
    cityName: 'Chennai',
    state: 'Tamil Nadu',
    stationName: 'T. Nagar Commercial EV Bay',
    address: 'South Usman Road, Near Panagal Park, T. Nagar, Chennai',
    latitude: 13.0418200,
    longitude: 80.2341400,
    distanceKm: 3.9,
    status: 'ACTIVE',
    basePricePerKwh: 14.5,
    operatingHours: '08:00 AM - 11:00 PM',
    amenities: ['Shopping Center', 'Restrooms'],
    chargers: [
      { chargerId: 60, chargerNumber: 'TN-CH01', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 14.5, status: 'AVAILABLE' },
      { chargerId: 61, chargerNumber: 'TN-CH02', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 12.0, status: 'AVAILABLE' },
      { chargerId: 62, chargerNumber: 'TN-CH03', connectorType: 'GB/T', powerKw: 15, pricePerKwh: 10.5, status: 'AVAILABLE' },
    ],
  },
  {
    stationId: 21,
    cityId: 4,
    cityName: 'Hyderabad',
    state: 'Telangana',
    stationName: 'Banjara Hills GreenCharger',
    address: 'Road No. 12, Banjara Hills, Hyderabad',
    latitude: 17.4156100,
    longitude: 78.4350200,
    distanceKm: 4.1,
    status: 'ACTIVE',
    basePricePerKwh: 15.0,
    operatingHours: '24/7 Open',
    amenities: ['Fine Dining', 'Waiting Area', 'Wi-Fi'],
    chargers: [
      { chargerId: 63, chargerNumber: 'BH-CH01', connectorType: 'CCS2', powerKw: 120, pricePerKwh: 18.5, status: 'AVAILABLE' },
      { chargerId: 64, chargerNumber: 'BH-CH02', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 15.0, status: 'AVAILABLE' },
      { chargerId: 65, chargerNumber: 'BH-CH03', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 12.0, status: 'AVAILABLE' },
    ],
  },
  {
    stationId: 22,
    cityId: 6,
    cityName: 'Pune',
    state: 'Maharashtra',
    stationName: 'Kothrud VoltCharge Terminal',
    address: 'Paud Road, Near Vanaz Corner, Kothrud, Pune',
    latitude: 18.5074200,
    longitude: 73.8077400,
    distanceKm: 3.3,
    status: 'ACTIVE',
    basePricePerKwh: 14.5,
    operatingHours: '24/7 Open',
    amenities: ['Tea Point', 'Restrooms', 'Tire Pressure Inflator'],
    chargers: [
      { chargerId: 66, chargerNumber: 'KOT-CH01', connectorType: 'CCS2', powerKw: 50, pricePerKwh: 14.5, status: 'AVAILABLE' },
      { chargerId: 67, chargerNumber: 'KOT-CH02', connectorType: 'TYPE2', powerKw: 22, pricePerKwh: 11.5, status: 'AVAILABLE' },
      { chargerId: 68, chargerNumber: 'KOT-CH03', connectorType: 'GB/T', powerKw: 15, pricePerKwh: 10.5, status: 'OCCUPIED' },
    ],
  },
];

export const VEHICLE_MODELS = [
  { modelId: 1, manufacturer: 'Tata Motors', modelName: 'Nexon EV Max', batteryCapacity: 40.5, maxChargingPower: 50.0 },
  { modelId: 2, manufacturer: 'Tata Motors', modelName: 'Punch EV', batteryCapacity: 35.0, maxChargingPower: 30.0 },
  { modelId: 3, manufacturer: 'MG Motor', modelName: 'ZS EV', batteryCapacity: 50.3, maxChargingPower: 50.0 },
  { modelId: 4, manufacturer: 'Mahindra', modelName: 'XUV400 EV', batteryCapacity: 39.4, maxChargingPower: 50.0 },
  { modelId: 5, manufacturer: 'Hyundai', modelName: 'Ioniq 5', batteryCapacity: 72.6, maxChargingPower: 150.0 },
  { modelId: 6, manufacturer: 'BYD', modelName: 'Atto 3', batteryCapacity: 60.5, maxChargingPower: 80.0 },
  { modelId: 7, manufacturer: 'Kia', modelName: 'EV6', batteryCapacity: 77.4, maxChargingPower: 240.0 },
  { modelId: 8, manufacturer: 'Ola Electric', modelName: 'S1 Pro Gen 2', batteryCapacity: 4.0, maxChargingPower: 3.3 },
  { modelId: 9, manufacturer: 'Ather Energy', modelName: '450X Gen 3', batteryCapacity: 3.7, maxChargingPower: 3.0 },
  { modelId: 10, manufacturer: 'TVS Motor', modelName: 'iQube Electric', batteryCapacity: 3.0, maxChargingPower: 2.5 },
];

export const CITIES = [
  { cityId: 1, cityName: 'Chennai', state: 'Tamil Nadu' },
  { cityId: 2, cityName: 'Bengaluru', state: 'Karnataka' },
  { cityId: 3, cityName: 'Vellore', state: 'Tamil Nadu' },
  { cityId: 4, cityName: 'Hyderabad', state: 'Telangana' },
  { cityId: 5, cityName: 'Coimbatore', state: 'Tamil Nadu' },
  { cityId: 6, cityName: 'Pune', state: 'Maharashtra' },
  { cityId: 7, cityName: 'Mumbai', state: 'Maharashtra' },
  { cityId: 8, cityName: 'Delhi NCR', state: 'Delhi' },
];

// Helper to safely read JSON from localStorage
function readStorage(key, defaultValue = null) {
  try {
    if (typeof localStorage === 'undefined') return defaultValue;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error(`Error reading ${key} from storage:`, err);
    return defaultValue;
  }
}

// Helper to safely write JSON to localStorage
function writeStorage(key, value) {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to storage:`, err);
  }
}

const INITIAL_USERS = [
  {
    userId: 1,
    name: 'Ayush Sharma',
    email: 'ayush.admin@voltix.in',
    phone: '+91-9876543201',
    password: 'voltix2026',
    role: 'ADMIN',
    createdAt: '2026-01-01T08:00:00.000Z',
  },
  {
    userId: 2,
    name: 'Rajesh Kumar',
    email: 'rajesh.operator@voltix.in',
    phone: '+91-9876543202',
    password: 'voltix2026',
    role: 'OPERATOR',
    createdAt: '2026-01-05T09:30:00.000Z',
  },
  {
    userId: 7,
    name: 'Rahul Verma',
    email: 'rahul.verma@gmail.com',
    phone: '+91-9811122334',
    password: 'voltix2026',
    role: 'USER',
    createdAt: '2026-01-18T10:00:00.000Z',
  },
];

// Initialize persistent station catalog if not present
function initCatalog() {
  const existingStations = readStorage(STORAGE_KEYS.STATIONS, null);
  if (!existingStations || !Array.isArray(existingStations) || existingStations.length < INITIAL_STATIONS.length) {
    writeStorage(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
  }

  let existingUsers = readStorage(STORAGE_KEYS.USERS, null);
  if (!existingUsers || !Array.isArray(existingUsers) || existingUsers.length === 0) {
    writeStorage(STORAGE_KEYS.USERS, INITIAL_USERS);
  } else {
    // Ensure standard database seed accounts exist and have passwords
    let updated = false;
    for (const seedUser of INITIAL_USERS) {
      const idx = existingUsers.findIndex(
        (u) => u.email.toLowerCase() === seedUser.email.toLowerCase()
      );
      if (idx === -1) {
        existingUsers.push(seedUser);
        updated = true;
      } else {
        if (!existingUsers[idx].password) {
          existingUsers[idx].password = seedUser.password;
          updated = true;
        }
        if (existingUsers[idx].role !== seedUser.role) {
          existingUsers[idx].role = seedUser.role;
          updated = true;
        }
      }
    }
    if (updated) {
      writeStorage(STORAGE_KEYS.USERS, existingUsers);
    }
  }
}
initCatalog();

export const dataStore = {
  // --------------------------------------------------------------------------
  // USER AUTHENTICATION & MANAGEMENT
  // --------------------------------------------------------------------------
  getUsers() {
    return readStorage(STORAGE_KEYS.USERS, []);
  },

  getCurrentUser() {
    return readStorage(STORAGE_KEYS.ACTIVE_USER, null);
  },

  setCurrentUser(user) {
    writeStorage(STORAGE_KEYS.ACTIVE_USER, user);
  },

  clearCurrentUser() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
  },

  registerUser({ name, email, phone, password, role = 'USER' }) {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      throw new Error('An account with this email address already exists.');
    }

    // Public registration is restricted to USER accounts
    const newUser = {
      userId: Date.now(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      password: password,
      role: 'USER',
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeStorage(STORAGE_KEYS.USERS, users);

    // Initialize clean 0-state wallet
    this.initWallet(newUser.userId);

    this.setCurrentUser(newUser);
    return newUser;
  },

  loginUser(email, password, selectedRole) {
    const users = this.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      throw new Error('Account not found. Please verify your email or register.');
    }

    if (user.password && password && user.password !== password) {
      throw new Error('Invalid email or password. Please check your credentials.');
    }

    if (selectedRole && user.role.toUpperCase() !== selectedRole.toUpperCase()) {
      throw new Error('Unable to sign in with the selected role. Please verify your account type and credentials.');
    }

    this.setCurrentUser(user);
    return user;
  },

  // --------------------------------------------------------------------------
  // WALLET MANAGEMENT
  // --------------------------------------------------------------------------
  initWallet(userId, initialBalance = 0) {
    if (!userId) return { walletId: 0, userId: 0, balance: 0.0, transactions: [] };
    const allWallets = readStorage(STORAGE_KEYS.WALLETS, {});
    if (!allWallets[userId]) {
      allWallets[userId] = {
        walletId: userId,
        userId,
        balance: Number(initialBalance) || 0.0,
        transactions: [],
      };
      writeStorage(STORAGE_KEYS.WALLETS, allWallets);
    }
    return allWallets[userId];
  },

  getWallet(userId) {
    if (!userId) return { walletId: 0, userId: 0, balance: 0.0, transactions: [] };
    const allWallets = readStorage(STORAGE_KEYS.WALLETS, {});
    if (!allWallets[userId]) {
      return this.initWallet(userId, 0);
    }
    return allWallets[userId];
  },

  addWalletFunds(userId, amount, method = 'UPI') {
    const wallet = this.getWallet(userId);
    const numAmount = Number(amount) || 0;
    const newBalance = (Number(wallet.balance) || 0) + numAmount;
    wallet.balance = newBalance;

    const tx = {
      transactionId: Date.now(),
      walletId: wallet.walletId,
      amount: numAmount,
      type: 'CREDIT',
      transactionType: 'CREDIT',
      date: new Date().toISOString(),
      timestamp: new Date().toISOString(),
      description: `Prepaid Top-Up via ${method}`,
      balanceAfter: newBalance,
    };

    if (!Array.isArray(wallet.transactions)) {
      wallet.transactions = [];
    }
    wallet.transactions.unshift(tx);

    const allWallets = readStorage(STORAGE_KEYS.WALLETS, {});
    allWallets[userId] = wallet;
    writeStorage(STORAGE_KEYS.WALLETS, allWallets);

    return wallet;
  },

  // --------------------------------------------------------------------------
  // VEHICLE MANAGEMENT
  // --------------------------------------------------------------------------
  getVehicles(userId) {
    if (!userId) return [];
    const allVehicles = readStorage(STORAGE_KEYS.VEHICLES, {});
    return allVehicles[userId] || [];
  },

  addVehicle(userId, { modelId, registrationNumber, initialBatteryPercentage = 50 }) {
    const allVehicles = readStorage(STORAGE_KEYS.VEHICLES, {});
    const userVehicles = allVehicles[userId] || [];

    const cleanReg = registrationNumber.trim().toUpperCase();
    if (userVehicles.some((v) => v.registrationNumber === cleanReg)) {
      throw new Error('A vehicle with this registration number is already registered to your account.');
    }

    const model = VEHICLE_MODELS.find((m) => m.modelId === Number(modelId)) || VEHICLE_MODELS[0];
    const soc = Math.min(100, Math.max(0, Number(initialBatteryPercentage) || 50));

    const newVehicle = {
      vehicleId: Date.now(),
      userId,
      modelId: model.modelId,
      manufacturer: model.manufacturer,
      modelName: model.modelName,
      registrationNumber: cleanReg,
      batteryPercentage: soc,
      batteryCapacity: model.batteryCapacity,
      maxPower: model.maxChargingPower,
      estimatedRangeKm: Math.round((soc / 100) * (model.batteryCapacity * 7.5)),
    };

    userVehicles.push(newVehicle);
    allVehicles[userId] = userVehicles;
    writeStorage(STORAGE_KEYS.VEHICLES, allVehicles);
    return newVehicle;
  },

  updateVehicleSoc(userId, vehicleId, newSoc) {
    const allVehicles = readStorage(STORAGE_KEYS.VEHICLES, {});
    const userVehicles = allVehicles[userId] || [];
    const index = userVehicles.findIndex((v) => v.vehicleId === Number(vehicleId));
    if (index !== -1) {
      const v = userVehicles[index];
      v.batteryPercentage = Math.min(100, Math.max(0, Number(newSoc)));
      v.estimatedRangeKm = Math.round((v.batteryPercentage / 100) * (v.batteryCapacity * 7.5));
      userVehicles[index] = v;
      allVehicles[userId] = userVehicles;
      writeStorage(STORAGE_KEYS.VEHICLES, allVehicles);
    }
  },

  deleteVehicle(vehicleId) {
    const allVehicles = readStorage(STORAGE_KEYS.VEHICLES, {});
    for (const uId of Object.keys(allVehicles)) {
      allVehicles[uId] = (allVehicles[uId] || []).filter((v) => v.vehicleId !== Number(vehicleId));
    }
    writeStorage(STORAGE_KEYS.VEHICLES, allVehicles);
  },

  // --------------------------------------------------------------------------
  // DIGITAL WALLET & DOUBLE-ENTRY TRANSACTIONS
  // --------------------------------------------------------------------------
  initWallet(userId) {
    const allWallets = readStorage(STORAGE_KEYS.WALLETS, {});
    if (!allWallets[userId]) {
      allWallets[userId] = {
        userId,
        balance: 0.0,
        transactions: [],
      };
      writeStorage(STORAGE_KEYS.WALLETS, allWallets);
    }
    return allWallets[userId];
  },

  getWallet(userId) {
    if (!userId) return { userId: 0, balance: 0.0, transactions: [] };
    const allWallets = readStorage(STORAGE_KEYS.WALLETS, {});
    if (!allWallets[userId]) {
      return this.initWallet(userId);
    }
    return allWallets[userId];
  },

  addWalletFunds(userId, amount, method = 'UPI') {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      throw new Error('Please enter a valid positive top-up amount.');
    }

    const allWallets = readStorage(STORAGE_KEYS.WALLETS, {});
    const wallet = allWallets[userId] || { userId, balance: 0.0, transactions: [] };

    wallet.balance += numAmount;
    const tx = {
      transactionId: Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'CREDIT',
      amount: numAmount,
      description: `${method} Balance Top-Up`,
      balanceAfter: wallet.balance,
    };

    wallet.transactions.unshift(tx);
    allWallets[userId] = wallet;
    writeStorage(STORAGE_KEYS.WALLETS, allWallets);
    return wallet;
  },

  debitWallet(userId, amount, description) {
    const numAmount = Number(amount);
    const allWallets = readStorage(STORAGE_KEYS.WALLETS, {});
    const wallet = allWallets[userId] || { userId, balance: 0.0, transactions: [] };

    if (wallet.balance < numAmount) {
      throw new Error(
        `Insufficient wallet balance. Required: ₹${numAmount.toFixed(2)}, Available: ₹${wallet.balance.toFixed(2)}.`
      );
    }

    wallet.balance -= numAmount;
    const tx = {
      transactionId: Date.now(),
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      type: 'DEBIT',
      amount: numAmount,
      description: description || 'Charging Session Settlement',
      balanceAfter: wallet.balance,
    };

    wallet.transactions.unshift(tx);
    allWallets[userId] = wallet;
    writeStorage(STORAGE_KEYS.WALLETS, allWallets);
    return wallet;
  },

  // --------------------------------------------------------------------------
  // CHARGING STATIONS & CHARGER AVAILABILITY
  // --------------------------------------------------------------------------
  getStations(filters = {}) {
    const stations = readStorage(STORAGE_KEYS.STATIONS, INITIAL_STATIONS);
    const allSessions = readStorage(STORAGE_KEYS.SESSIONS, []);
    const allReservations = readStorage(STORAGE_KEYS.RESERVATIONS, []);

    // Dynamically calculate live bay availability based on actual active sessions & reservations
    const enriched = stations.map((s) => {
      const enrichedChargers = s.chargers.map((ch) => {
        const isOccupied = allSessions.some(
          (sess) => sess.chargerId === ch.chargerId && sess.status === 'CHARGING'
        );
        const isReserved = allReservations.some(
          (res) => res.chargerId === ch.chargerId && res.status === 'CONFIRMED'
        );

        let status = 'AVAILABLE';
        if (isOccupied) status = 'OCCUPIED';
        else if (isReserved) status = 'RESERVED';

        return { ...ch, status };
      });

      const availableChargersCount = enrichedChargers.filter((c) => c.status === 'AVAILABLE').length;

      return {
        ...s,
        chargers: enrichedChargers,
        availableChargersCount,
        totalChargersCount: enrichedChargers.length,
      };
    });

    let filtered = [...enriched];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.stationName.toLowerCase().includes(q) ||
          s.cityName.toLowerCase().includes(q) ||
          s.address.toLowerCase().includes(q)
      );
    }

    if (filters.cityId) {
      filtered = filtered.filter((s) => s.cityId === Number(filters.cityId));
    }

    if (filters.connectorType) {
      filtered = filtered.filter((s) =>
        s.chargers.some((ch) => ch.connectorType === filters.connectorType)
      );
    }

    if (filters.speedCategory) {
      filtered = filtered.filter((s) => {
        if (filters.speedCategory === 'Ultra Fast') {
          return s.chargers.some((ch) => ch.powerKw >= 100);
        }
        if (filters.speedCategory === 'DC Fast') {
          return s.chargers.some((ch) => ch.powerKw >= 50 && ch.powerKw < 100);
        }
        if (filters.speedCategory === 'AC Rapid') {
          return s.chargers.some((ch) => ch.powerKw <= 22);
        }
        return true;
      });
    }

    if (filters.availableOnly) {
      filtered = filtered.filter((s) => s.availableChargersCount > 0);
    }

    return filtered;
  },

  getStationById(stationId) {
    const list = this.getStations();
    return list.find((s) => s.stationId === Number(stationId)) || null;
  },

  // --------------------------------------------------------------------------
  // RESERVATIONS
  // --------------------------------------------------------------------------
  getReservations(userId) {
    const list = readStorage(STORAGE_KEYS.RESERVATIONS, []);
    if (!userId) return list;
    return list.filter((r) => r.userId === Number(userId));
  },

  createReservation({ userId, vehicleId, stationId, chargerId, startTime, endTime, estimatedCost = 0 }) {
    const station = this.getStationById(stationId);
    if (!station) throw new Error('Selected station does not exist.');

    const charger = station.chargers.find((c) => c.chargerId === Number(chargerId));
    if (!charger) throw new Error('Selected charger bay does not exist.');

    if (charger.status !== 'AVAILABLE') {
      throw new Error(`Charger ${charger.chargerNumber} is currently ${charger.status}. Please select an available bay.`);
    }

    const userVehicles = this.getVehicles(userId);
    const vehicle = userVehicles.find((v) => v.vehicleId === Number(vehicleId));

    const list = readStorage(STORAGE_KEYS.RESERVATIONS, []);
    const newReservation = {
      reservationId: Date.now(),
      userId: Number(userId),
      vehicleId: Number(vehicleId),
      vehicleName: vehicle ? `${vehicle.manufacturer} ${vehicle.modelName} (${vehicle.registrationNumber})` : 'Registered EV',
      stationId: Number(stationId),
      stationName: station.stationName,
      chargerId: Number(chargerId),
      chargerNumber: charger.chargerNumber,
      connectorType: `${charger.connectorType} (${charger.powerKw} kW)`,
      startTime,
      endTime,
      estimatedCost: Number(estimatedCost) || 0,
      status: 'CONFIRMED',
      createdAt: new Date().toISOString(),
    };

    list.unshift(newReservation);
    writeStorage(STORAGE_KEYS.RESERVATIONS, list);
    return newReservation;
  },

  cancelReservation(reservationId) {
    const list = readStorage(STORAGE_KEYS.RESERVATIONS, []);
    const index = list.findIndex((r) => r.reservationId === Number(reservationId));
    if (index !== -1) {
      list[index].status = 'CANCELLED';
      writeStorage(STORAGE_KEYS.RESERVATIONS, list);
      return list[index];
    }
    throw new Error('Reservation record not found.');
  },

  // --------------------------------------------------------------------------
  // CHARGING SESSIONS
  // --------------------------------------------------------------------------
  getSessions(userId) {
    const list = readStorage(STORAGE_KEYS.SESSIONS, []);
    if (!userId) return list;
    return list.filter((s) => s.userId === Number(userId));
  },

  getActiveSession(userId) {
    const list = this.getSessions(userId);
    return list.find((s) => s.status === 'CHARGING') || null;
  },

  startChargingSession({ userId, vehicleId, stationId, chargerId, reservationId = null }) {
    const active = this.getActiveSession(userId);
    if (active) {
      throw new Error('You already have an active charging session in progress.');
    }

    const station = this.getStationById(stationId);
    if (!station) throw new Error('Station not found.');

    const charger = station.chargers.find((c) => c.chargerId === Number(chargerId));
    if (!charger) throw new Error('Charger not found.');

    const userVehicles = this.getVehicles(userId);
    const vehicle = userVehicles.find((v) => v.vehicleId === Number(vehicleId));

    const startSoc = vehicle ? vehicle.batteryPercentage : 50;

    const list = readStorage(STORAGE_KEYS.SESSIONS, []);
    const newSession = {
      sessionId: Date.now(),
      reservationId,
      userId: Number(userId),
      vehicleId: Number(vehicleId),
      vehicleName: vehicle ? `${vehicle.manufacturer} ${vehicle.modelName}` : 'Registered EV',
      registrationNumber: vehicle ? vehicle.registrationNumber : 'EV-UNIT',
      stationId: Number(stationId),
      stationName: station.stationName,
      address: station.address,
      chargerId: Number(chargerId),
      chargerNumber: charger.chargerNumber,
      connectorType: charger.connectorType,
      powerKw: charger.powerKw,
      pricePerKwh: charger.pricePerKwh || station.basePricePerKwh,
      startTime: Date.now(),
      startBatteryPercentage: startSoc,
      status: 'CHARGING',
    };

    list.unshift(newSession);
    writeStorage(STORAGE_KEYS.SESSIONS, list);

    // If linked to reservation, update reservation status
    if (reservationId) {
      const resList = readStorage(STORAGE_KEYS.RESERVATIONS, []);
      const rIdx = resList.findIndex((r) => r.reservationId === Number(reservationId));
      if (rIdx !== -1) {
        resList[rIdx].status = 'ACTIVE';
        writeStorage(STORAGE_KEYS.RESERVATIONS, resList);
      }
    }

    return newSession;
  },

  endChargingSession(sessionId) {
    const list = readStorage(STORAGE_KEYS.SESSIONS, []);
    const index = list.findIndex((s) => s.sessionId === Number(sessionId));
    if (index === -1) {
      throw new Error('Charging session not found.');
    }

    const session = list[index];
    const now = Date.now();
    const elapsedMinutes = Math.max(1, Math.round((now - session.startTime) / 60000));
    const powerKw = session.powerKw || 50;
    const energyConsumed = +(powerKw * (elapsedMinutes / 60)).toFixed(2);
    const rate = session.pricePerKwh || 14.0;
    const energyCost = +(energyConsumed * rate).toFixed(2);
    const reservationFee = session.reservationId ? 50.0 : 0.0;
    const finalCost = +(energyCost + reservationFee).toFixed(2);

    session.status = 'COMPLETED';
    session.endTime = now;
    session.durationMinutes = elapsedMinutes;
    session.energyConsumedKwh = energyConsumed;
    session.finalCost = finalCost;
    session.paymentStatus = 'UNPAID';

    list[index] = session;
    writeStorage(STORAGE_KEYS.SESSIONS, list);

    // Update vehicle State of Charge
    const userVehicles = this.getVehicles(session.userId);
    const v = userVehicles.find((vh) => vh.vehicleId === session.vehicleId);
    if (v) {
      const addedSoc = (energyConsumed / v.batteryCapacity) * 100;
      const newSoc = Math.min(100, Math.round(session.startBatteryPercentage + addedSoc));
      this.updateVehicleSoc(session.userId, session.vehicleId, newSoc);
    }

    // Complete reservation if applicable
    if (session.reservationId) {
      const resList = readStorage(STORAGE_KEYS.RESERVATIONS, []);
      const rIdx = resList.findIndex((r) => r.reservationId === Number(session.reservationId));
      if (rIdx !== -1) {
        resList[rIdx].status = 'COMPLETED';
        writeStorage(STORAGE_KEYS.RESERVATIONS, resList);
      }
    }

    return session;
  },

  // --------------------------------------------------------------------------
  // INVOICE SETTLEMENT & PAYMENTS
  // --------------------------------------------------------------------------
  processPayment({ sessionId, userId, amount, paymentMethod }) {
    const numAmount = Number(amount);
    const sessions = readStorage(STORAGE_KEYS.SESSIONS, []);
    const sIndex = sessions.findIndex((s) => s.sessionId === Number(sessionId));

    if (paymentMethod === 'WALLET') {
      this.debitWallet(userId, numAmount, `Charging Session #${sessionId} Settlement`);
    }

    const receipt = {
      paymentId: Date.now(),
      sessionId: Number(sessionId),
      userId: Number(userId),
      amount: numAmount,
      paymentMethod,
      paymentStatus: 'SUCCESS',
      paymentTime: new Date().toISOString().replace('T', ' ').substring(0, 19),
      transactionRef: `VX-TXN-${Date.now().toString().slice(-6)}`,
    };

    const payments = readStorage(STORAGE_KEYS.PAYMENTS, []);
    payments.unshift(receipt);
    writeStorage(STORAGE_KEYS.PAYMENTS, payments);

    if (sIndex !== -1) {
      sessions[sIndex].paymentStatus = 'SUCCESS';
      sessions[sIndex].paymentMethod = paymentMethod;
      writeStorage(STORAGE_KEYS.SESSIONS, sessions);
    }

    return receipt;
  },

  // --------------------------------------------------------------------------
  // USER METRICS DERIVATION (REAL-TIME REACTIVE AGGREGATION)
  // --------------------------------------------------------------------------
  getUserMetrics(userId) {
    if (!userId) {
      return {
        walletBalance: 0.0,
        monthlyEnergyKwh: 0.0,
        co2OffsetKg: 0,
        completedChargesCount: 0,
      };
    }

    const wallet = this.getWallet(userId);
    const userSessions = this.getSessions(userId);
    const completedSessions = userSessions.filter((s) => s.status === 'COMPLETED');

    const totalEnergy = completedSessions.reduce(
      (sum, s) => sum + (Number(s.energyConsumedKwh) || 0),
      0
    );

    const co2Kg = Math.round(totalEnergy * 0.82);

    return {
      walletBalance: wallet.balance,
      monthlyEnergyKwh: +totalEnergy.toFixed(1),
      co2OffsetKg: co2Kg,
      completedChargesCount: completedSessions.length,
    };
  },

  // --------------------------------------------------------------------------
  // NETWORK-LEVEL AGGREGATE METRICS (FOR OPERATOR & ADMIN)
  // --------------------------------------------------------------------------
  getNetworkMetrics() {
    const allUsers = this.getUsers();
    const stations = this.getStations();
    const allSessions = readStorage(STORAGE_KEYS.SESSIONS, []);
    const completedSessions = allSessions.filter((s) => s.status === 'COMPLETED');
    const activeSessions = allSessions.filter((s) => s.status === 'CHARGING');

    const totalChargers = stations.reduce((sum, s) => sum + s.chargers.length, 0);
    const activeChargers = stations.reduce(
      (sum, s) => sum + s.chargers.filter((c) => c.status === 'AVAILABLE' || c.status === 'OCCUPIED').length,
      0
    );

    const totalEnergy = completedSessions.reduce(
      (sum, s) => sum + (Number(s.energyConsumedKwh) || 0),
      0
    );

    const totalRevenue = completedSessions.reduce(
      (sum, s) => sum + (Number(s.finalCost) || 0),
      0
    );

    const co2Tons = +((totalEnergy * 0.82) / 1000).toFixed(3);

    return {
      totalUsers: allUsers.length,
      totalStations: stations.length,
      totalChargers,
      activeChargers,
      activeSessionsCount: activeSessions.length,
      completedSessionsCount: completedSessions.length,
      totalEnergyDeliveredKwh: +totalEnergy.toFixed(1),
      totalRevenueInr: +totalRevenue.toFixed(2),
      co2AvoidedTons: co2Tons,
    };
  },
};

export default dataStore;
