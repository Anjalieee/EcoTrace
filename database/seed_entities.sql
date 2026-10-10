USE ecotrace;

INSERT INTO collectors (name, registration_number, address, city, lat, lng, service_radius_km, weekly_capacity_kg, current_capacity_kg, accepted_types, password_hash) VALUES
('GreenCycle Bangalore', 'CPCB-COL-BLR-001', 'Koramangala, Bangalore', 'Bangalore', 12.9352, 77.6245, 15, 800, 800, '["laptop","phone","tablet","monitor"]', '$2b$12$dummy'),
('EcoCollect Indiranagar', 'CPCB-COL-BLR-002', 'Indiranagar, Bangalore', 'Bangalore', 12.9716, 77.6412, 12, 600, 600, '["phone","laptop","battery"]', '$2b$12$dummy'),
('TechWaste HSR', 'CPCB-COL-BLR-003', 'HSR Layout, Bangalore', 'Bangalore', 12.9116, 77.6389, 10, 500, 500, '["desktop","server","printer"]', '$2b$12$dummy'),
('RecycleHub Whitefield', 'CPCB-COL-BLR-004', 'Whitefield, Bangalore', 'Bangalore', 12.9698, 77.7499, 20, 1000, 1000, '["laptop","desktop","tv","appliance"]', '$2b$12$dummy'),
('EcoKabadiwala Jayanagar', 'CPCB-COL-BLR-005', 'Jayanagar, Bangalore', 'Bangalore', 12.9255, 77.5830, 8, 300, 300, '["phone","tablet","battery"]', '$2b$12$dummy'),
('GreenTech Delhi', 'CPCB-COL-DEL-001', 'Connaught Place, Delhi', 'Delhi', 28.6315, 77.2167, 20, 900, 900, '["laptop","phone","server"]', '$2b$12$dummy'),
('RecycleIndia Gurugram', 'CPCB-COL-DEL-002', 'Sector 44, Gurugram', 'Delhi', 28.4595, 77.0266, 25, 700, 700, '["laptop","desktop","monitor"]', '$2b$12$dummy'),
('EcoWaste Mumbai', 'CPCB-COL-MUM-001', 'Andheri, Mumbai', 'Mumbai', 19.1136, 72.8697, 15, 800, 800, '["phone","laptop","tv"]', '$2b$12$dummy'),
('GreenCollect Pune', 'CPCB-COL-PUN-001', 'Kothrud, Pune', 'Pune', 18.5074, 73.8077, 20, 600, 600, '["laptop","desktop","printer"]', '$2b$12$dummy'),
('TechRecycle Chennai', 'CPCB-COL-CHN-001', 'Anna Nagar, Chennai', 'Chennai', 13.0827, 80.2707, 18, 700, 700, '["phone","tablet","monitor"]', '$2b$12$dummy');

INSERT INTO recyclers (name, registration_number, address, city, lat, lng, specialisation, weekly_capacity_kg, current_capacity_kg, accepted_types, password_hash) VALUES
('Attero Bangalore', 'CPCB-REC-BLR-001', 'Electronic City, Bangalore', 'Bangalore', 12.8456, 77.6603, 'it_equipment', 5000, 5000, '["laptop","desktop","server","monitor","printer"]', '$2b$12$dummy'),
('Ecoreco Bangalore', 'CPCB-REC-BLR-002', 'Peenya Industrial Area, Bangalore', 'Bangalore', 13.0298, 77.5228, 'mixed', 3000, 3000, '["phone","tablet","battery","laptop"]', '$2b$12$dummy'),
('Karo Sambhav South', 'CPCB-REC-BLR-003', 'Bommasandra, Bangalore', 'Bangalore', 12.8182, 77.6955, 'batteries', 2000, 2000, '["battery","phone","tablet"]', '$2b$12$dummy'),
('Attero Delhi NCR', 'CPCB-REC-DEL-001', 'Sector 63, Noida', 'Delhi', 28.6210, 77.3762, 'it_equipment', 8000, 8000, '["laptop","desktop","server","monitor"]', '$2b$12$dummy'),
('TES-AMM Mumbai', 'CPCB-REC-MUM-001', 'Taloja, Mumbai', 'Mumbai', 19.0330, 73.1167, 'mixed', 6000, 6000, '["laptop","phone","tv","appliance"]', '$2b$12$dummy'),
('Greenscape Pune', 'CPCB-REC-PUN-001', 'Ranjangaon MIDC, Pune', 'Pune', 18.6986, 74.1527, 'it_equipment', 4000, 4000, '["laptop","desktop","server"]', '$2b$12$dummy');