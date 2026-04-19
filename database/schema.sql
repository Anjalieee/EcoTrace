CREATE DATABASE IF NOT EXISTS ecotrace;
USE ecotrace;

-- ORGANISATIONS (bulk consumers)
CREATE TABLE organisations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(15) UNIQUE NOT NULL,
    org_type ENUM('company','hospital','college','rwa','small_business') NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    employee_count INT DEFAULT 0,
    epr_obligation_kg DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- COLLECTORS (PROs, aggregators)
CREATE TABLE collectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    service_radius_km DECIMAL(5,2) DEFAULT 10,
    min_batch_kg DECIMAL(8,2) DEFAULT 0,
    weekly_capacity_kg DECIMAL(10,2) DEFAULT 500,
    current_capacity_kg DECIMAL(10,2) DEFAULT 500,
    is_available BOOLEAN DEFAULT TRUE,
    accepted_types JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RECYCLERS
CREATE TABLE recyclers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    registration_number VARCHAR(100) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    lat DECIMAL(10, 8) NOT NULL,
    lng DECIMAL(11, 8) NOT NULL,
    specialisation ENUM('it_equipment','batteries','large_appliances','mixed') NOT NULL,
    weekly_capacity_kg DECIMAL(10,2) DEFAULT 1000,
    current_capacity_kg DECIMAL(10,2) DEFAULT 1000,
    accepted_types JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DEVICE MASTER LIST
CREATE TABLE devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category ENUM('phone','laptop','desktop','monitor','printer',
                  'server','tablet','battery','tv','appliance','other') NOT NULL,
    avg_weight_kg DECIMAL(6,3) NOT NULL,
    copper_percent DECIMAL(5,3) DEFAULT 0,
    gold_mg_per_unit DECIMAL(8,3) DEFAULT 0,
    lead_mg_per_unit DECIMAL(8,3) DEFAULT 0,
    cadmium_mg_per_unit DECIMAL(8,3) DEFAULT 0,
    hazard_tier ENUM('low','medium','high') DEFAULT 'low',
    epr_tier ENUM('standard','premium','hazardous') DEFAULT 'standard',
    avg_resale_value_inr DECIMAL(10,2) DEFAULT 0
);

-- BATCHES
CREATE TABLE batches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    batch_uid VARCHAR(50) UNIQUE NOT NULL,
    org_id INT NOT NULL,
    devices_json JSON NOT NULL,
    total_devices INT DEFAULT 0,
    estimated_weight_kg DECIMAL(10,2) DEFAULT 0,
    refurbishable_count INT DEFAULT 0,
    recyclable_count INT DEFAULT 0,
    hazardous_count INT DEFAULT 0,
    epr_credit_estimate DECIMAL(10,2) DEFAULT 0,
    estimated_copper_kg DECIMAL(8,3) DEFAULT 0,
    estimated_gold_g DECIMAL(8,3) DEFAULT 0,
    estimated_cadmium_g DECIMAL(8,3) DEFAULT 0,
    status ENUM('pending','collector_assigned','collected',
                'at_recycler','certified') DEFAULT 'pending',
    collector_id INT,
    recycler_id INT,
    pickup_requested_at TIMESTAMP NULL,
    collected_at TIMESTAMP NULL,
    received_at TIMESTAMP NULL,
    certified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (org_id) REFERENCES organisations(id),
    FOREIGN KEY (collector_id) REFERENCES collectors(id),
    FOREIGN KEY (recycler_id) REFERENCES recyclers(id)
);

-- EPR CERTIFICATES
CREATE TABLE certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    certificate_uid VARCHAR(50) UNIQUE NOT NULL,
    batch_id INT NOT NULL,
    org_id INT NOT NULL,
    collector_id INT NOT NULL,
    recycler_id INT NOT NULL,
    weight_kg DECIMAL(10,2) NOT NULL,
    copper_recovered_kg DECIMAL(8,3) DEFAULT 0,
    gold_recovered_g DECIMAL(8,3) DEFAULT 0,
    devices_refurbished INT DEFAULT 0,
    co2_avoided_kg DECIMAL(10,3) DEFAULT 0,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES batches(id),
    FOREIGN KEY (org_id) REFERENCES organisations(id)
);

-- ENVIRONMENTAL IMPACT (city-level aggregated)
CREATE TABLE impact_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    month_year VARCHAR(7) NOT NULL,
    total_kg_diverted DECIMAL(12,3) DEFAULT 0,
    co2_avoided_kg DECIMAL(12,3) DEFAULT 0,
    gold_recovered_g DECIMAL(12,3) DEFAULT 0,
    copper_recovered_kg DECIMAL(12,3) DEFAULT 0,
    cadmium_contained_g DECIMAL(12,3) DEFAULT 0,
    certificates_issued INT DEFAULT 0,
    UNIQUE KEY unique_city_month (city, month_year)
);