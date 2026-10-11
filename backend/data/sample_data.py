"""
EcoTrace - In-Memory Sample Data Store
All data lives here as Python dicts. No database required.
"""
import uuid
from datetime import datetime

# ─── DEVICE CATALOGUE ─────────────────────────────────────────────────────────
DEVICES = {
    1:  {"id": 1,  "name": "Laptop",                "category": "IT Equipment",       "avg_weight_kg": 2.5,  "epr_category": "ITEW",  "co2_per_unit_kg": 5.0},
    2:  {"id": 2,  "name": "Desktop Computer",       "category": "IT Equipment",       "avg_weight_kg": 8.0,  "epr_category": "ITEW",  "co2_per_unit_kg": 16.0},
    3:  {"id": 3,  "name": "Smartphone",             "category": "IT Equipment",       "avg_weight_kg": 0.2,  "epr_category": "ITEW",  "co2_per_unit_kg": 0.4},
    4:  {"id": 4,  "name": "Tablet",                 "category": "IT Equipment",       "avg_weight_kg": 0.5,  "epr_category": "ITEW",  "co2_per_unit_kg": 1.0},
    5:  {"id": 5,  "name": "Printer",                "category": "IT Equipment",       "avg_weight_kg": 7.0,  "epr_category": "ITEW",  "co2_per_unit_kg": 14.0},
    6:  {"id": 6,  "name": "Monitor (LED)",          "category": "IT Equipment",       "avg_weight_kg": 5.0,  "epr_category": "ITEW",  "co2_per_unit_kg": 10.0},
    7:  {"id": 7,  "name": "Scanner",                "category": "IT Equipment",       "avg_weight_kg": 4.0,  "epr_category": "ITEW",  "co2_per_unit_kg": 8.0},
    8:  {"id": 8,  "name": "Server Rack Unit",       "category": "IT Equipment",       "avg_weight_kg": 25.0, "epr_category": "ITEW",  "co2_per_unit_kg": 50.0},
    9:  {"id": 9,  "name": "UPS Battery System",     "category": "Batteries",          "avg_weight_kg": 15.0, "epr_category": "Battery","co2_per_unit_kg": 30.0},
    10: {"id": 10, "name": "Router / Network Switch","category": "IT Equipment",       "avg_weight_kg": 1.5,  "epr_category": "ITEW",  "co2_per_unit_kg": 3.0},
    11: {"id": 11, "name": "Television (LED)",       "category": "Consumer Electronics","avg_weight_kg": 12.0, "epr_category": "CED",   "co2_per_unit_kg": 24.0},
    12: {"id": 12, "name": "Air Conditioner",        "category": "Large Appliances",   "avg_weight_kg": 35.0, "epr_category": "LCEEW", "co2_per_unit_kg": 70.0},
}

# ─── ORGANISATIONS (Bulk Consumers) ───────────────────────────────────────────
ORGANISATIONS = {
    1: {"id": 1, "name": "TechCorp India Ltd",        "gst_number": "29AABCT1332L1ZF", "org_type": "IT Company",               "address": "MG Road, Bengaluru",            "city": "Bengaluru",  "lat": 12.9716, "lng": 77.5946, "employee_count": 2500, "epr_obligation_kg": 500,  "registered_at": "2024-01-10"},
    2: {"id": 2, "name": "Apollo Hospital Network",   "gst_number": "27AABCA1234M1ZA", "org_type": "Hospital",                  "address": "Andheri West, Mumbai",          "city": "Mumbai",     "lat": 19.1197, "lng": 72.8468, "employee_count": 800,  "epr_obligation_kg": 150,  "registered_at": "2024-01-15"},
    3: {"id": 3, "name": "IIT Delhi",                 "gst_number": "07AAAAI0123B1ZB", "org_type": "College",                   "address": "Hauz Khas, New Delhi",          "city": "Delhi",      "lat": 28.5452, "lng": 77.1926, "employee_count": 5000, "epr_obligation_kg": 300,  "registered_at": "2024-02-01"},
    4: {"id": 4, "name": "GreenRWA Society",          "gst_number": "27AAACG5678N2ZC", "org_type": "RWA",                       "address": "Kothrud, Pune",                 "city": "Pune",       "lat": 18.5074, "lng": 73.8077, "employee_count": 0,    "epr_obligation_kg": 50,   "registered_at": "2024-02-10"},
    5: {"id": 5, "name": "Wipro Technologies",        "gst_number": "36AAACW0123P1ZD", "org_type": "IT Company",               "address": "HITECH City, Hyderabad",        "city": "Hyderabad",  "lat": 17.4474, "lng": 78.3762, "employee_count": 7000, "epr_obligation_kg": 1200, "registered_at": "2024-02-15"},
    6: {"id": 6, "name": "Fortis Healthcare",         "gst_number": "07AAACF4321Q1ZE", "org_type": "Hospital",                  "address": "Vasant Kunj, New Delhi",        "city": "Delhi",      "lat": 28.5205, "lng": 77.1662, "employee_count": 1200, "epr_obligation_kg": 200,  "registered_at": "2024-03-01"},
    7: {"id": 7, "name": "Whitefield Co-working Hub", "gst_number": "29AAACW8765R2ZF", "org_type": "Co-working Space",          "address": "Whitefield, Bengaluru",         "city": "Bengaluru",  "lat": 12.9698, "lng": 77.7500, "employee_count": 500,  "epr_obligation_kg": 80,   "registered_at": "2024-03-10"},
    8: {"id": 8, "name": "Delhi Public School",       "gst_number": "07AAACD1122S1ZG", "org_type": "Educational Institution",  "address": "R.K. Puram, New Delhi",         "city": "Delhi",      "lat": 28.5672, "lng": 77.1889, "employee_count": 2000, "epr_obligation_kg": 120,  "registered_at": "2024-03-15"},
}

# ─── COLLECTORS ───────────────────────────────────────────────────────────────
COLLECTORS = {
    1: {"id": 1, "name": "GreenPick PRO",            "registration_number": "CPCB-COL-2021-001", "address": "Whitefield, Bengaluru",      "city": "Bengaluru",  "lat": 12.9700, "lng": 77.7500, "service_radius_km": 30, "min_batch_kg": 10,  "weekly_capacity_kg": 500, "accepted_types": ["IT Equipment","Batteries","Consumer Electronics"],                  "is_available": True,  "batches_collected": 47, "rating": 4.8},
    2: {"id": 2, "name": "EcoCollect India",          "registration_number": "CPCB-COL-2020-034", "address": "Andheri East, Mumbai",       "city": "Mumbai",     "lat": 19.1200, "lng": 72.8400, "service_radius_km": 25, "min_batch_kg": 5,   "weekly_capacity_kg": 700, "accepted_types": ["IT Equipment","Large Appliances"],                                       "is_available": True,  "batches_collected": 89, "rating": 4.6},
    3: {"id": 3, "name": "RecoverTech PRO",           "registration_number": "CPCB-COL-2022-009", "address": "Connaught Place, Delhi",     "city": "Delhi",      "lat": 28.6315, "lng": 77.2167, "service_radius_km": 35, "min_batch_kg": 20,  "weekly_capacity_kg": 900, "accepted_types": ["IT Equipment","Batteries","Consumer Electronics","Large Appliances"],   "is_available": True,  "batches_collected": 63, "rating": 4.7},
    4: {"id": 4, "name": "CleanCircuit Aggregator",   "registration_number": "CPCB-COL-2021-056", "address": "HITECH City, Hyderabad",     "city": "Hyderabad",  "lat": 17.4500, "lng": 78.3800, "service_radius_km": 20, "min_batch_kg": 15,  "weekly_capacity_kg": 400, "accepted_types": ["IT Equipment"],                                                          "is_available": True,  "batches_collected": 31, "rating": 4.5},
    5: {"id": 5, "name": "PureRefurb Collector",      "registration_number": "CPCB-COL-2023-012", "address": "Kothrud, Pune",             "city": "Pune",       "lat": 18.5100, "lng": 73.8100, "service_radius_km": 15, "min_batch_kg": 5,   "weekly_capacity_kg": 300, "accepted_types": ["IT Equipment","Consumer Electronics"],                                  "is_available": False, "batches_collected": 19, "rating": 4.3},
    6: {"id": 6, "name": "CycleRight PRO",            "registration_number": "CPCB-COL-2020-078", "address": "T. Nagar, Chennai",         "city": "Chennai",    "lat": 13.0418, "lng": 80.2341, "service_radius_km": 25, "min_batch_kg": 10,  "weekly_capacity_kg": 600, "accepted_types": ["IT Equipment","Batteries","Consumer Electronics"],                  "is_available": True,  "batches_collected": 55, "rating": 4.9},
    7: {"id": 7, "name": "Capital E-Waste Collectives", "registration_number": "CPCB-COL-2024-101", "address": "Lajpat Nagar, Delhi",        "city": "Delhi",      "lat": 28.5677, "lng": 77.2433, "service_radius_km": 30, "min_batch_kg": 5,   "weekly_capacity_kg": 650, "accepted_types": ["IT Equipment","Batteries","Consumer Electronics"],                  "is_available": True,  "batches_collected": 28, "rating": 4.7},
    8: {"id": 8, "name": "Yamuna Circular Logistics",   "registration_number": "CPCB-COL-2024-102", "address": "Rohini, Delhi",             "city": "Delhi",      "lat": 28.7495, "lng": 77.0565, "service_radius_km": 35, "min_batch_kg": 10,  "weekly_capacity_kg": 800, "accepted_types": ["IT Equipment","Large Appliances"],                                         "is_available": True,  "batches_collected": 34, "rating": 4.6},
    9: {"id": 9, "name": "South Delhi Resource Recovery", "registration_number": "CPCB-COL-2024-103", "address": "Okhla, Delhi",              "city": "Delhi",      "lat": 28.5355, "lng": 77.2750, "service_radius_km": 25, "min_batch_kg": 5,   "weekly_capacity_kg": 450, "accepted_types": ["IT Equipment","Batteries"],                                               "is_available": True,  "batches_collected": 22, "rating": 4.8},
}

# ─── RECYCLERS ────────────────────────────────────────────────────────────────
RECYCLERS = {
    1: {"id": 1, "name": "Attero Recycling Pvt Ltd",   "registration_number": "CPCB-REC-2016-001", "address": "Sector 135, Noida",         "city": "Noida",      "lat": 28.5355, "lng": 77.3910, "specialisation": "IT Equipment",     "weekly_capacity_kg": 5000, "accepted_types": ["IT Equipment","Batteries","Consumer Electronics"],          "is_available": True,  "recovery_rate_pct": 92, "co2_avoided_total_kg": 45200},
    2: {"id": 2, "name": "Ecoreco Pvt Ltd",             "registration_number": "CPCB-REC-2012-004", "address": "Pawane MIDC, Mumbai",       "city": "Mumbai",     "lat": 19.0728, "lng": 73.0183, "specialisation": "Mixed",            "weekly_capacity_kg": 3000, "accepted_types": ["IT Equipment","Large Appliances","Consumer Electronics"],  "is_available": True,  "recovery_rate_pct": 88, "co2_avoided_total_kg": 32800},
    3: {"id": 3, "name": "Karo Sambhav Services",       "registration_number": "CPCB-REC-2018-017", "address": "Okhla Industrial, Delhi",   "city": "Delhi",      "lat": 28.5507, "lng": 77.2750, "specialisation": "IT Equipment",     "weekly_capacity_kg": 4000, "accepted_types": ["IT Equipment","Batteries"],                                 "is_available": True,  "recovery_rate_pct": 90, "co2_avoided_total_kg": 28900},
    4: {"id": 4, "name": "E-Parisaraa Pvt Ltd",         "registration_number": "CPCB-REC-2005-001", "address": "Dobaspet, Bengaluru",       "city": "Bengaluru",  "lat": 13.1000, "lng": 77.5000, "specialisation": "IT Equipment",     "weekly_capacity_kg": 2000, "accepted_types": ["IT Equipment","Consumer Electronics"],                     "is_available": True,  "recovery_rate_pct": 95, "co2_avoided_total_kg": 67400},
    5: {"id": 5, "name": "TES-AMM India",               "registration_number": "CPCB-REC-2014-023", "address": "Ambattur, Chennai",         "city": "Chennai",    "lat": 13.1143, "lng": 80.1548, "specialisation": "Large Appliances", "weekly_capacity_kg": 2500, "accepted_types": ["Large Appliances","Batteries","Consumer Electronics"],     "is_available": True,  "recovery_rate_pct": 87, "co2_avoided_total_kg": 19600},
    6: {"id": 6, "name": "Delhi Reuse and Recovery Works", "registration_number": "CPCB-REC-2024-011", "address": "Okhla Industrial Area, Delhi", "city": "Delhi", "lat": 28.5355, "lng": 77.2750, "specialisation": "Mixed", "weekly_capacity_kg": 1800, "accepted_types": ["IT Equipment","Batteries","Consumer Electronics"], "is_available": True, "recovery_rate_pct": 89, "co2_avoided_total_kg": 12400},
    7: {"id": 7, "name": "North Capital Materials Recovery", "registration_number": "CPCB-REC-2024-012", "address": "Bawana Industrial Area, Delhi", "city": "Delhi", "lat": 28.7980, "lng": 77.0480, "specialisation": "Large Appliances", "weekly_capacity_kg": 2400, "accepted_types": ["Large Appliances","Batteries"], "is_available": True, "recovery_rate_pct": 86, "co2_avoided_total_kg": 9800},
    8: {"id": 8, "name": "Green Circuit Recyclers Delhi", "registration_number": "CPCB-REC-2024-013", "address": "Naraina Industrial Area, Delhi", "city": "Delhi", "lat": 28.6420, "lng": 77.1420, "specialisation": "IT Equipment", "weekly_capacity_kg": 1500, "accepted_types": ["IT Equipment","Consumer Electronics"], "is_available": True, "recovery_rate_pct": 91, "co2_avoided_total_kg": 11300},
}

# ─── BATCHES ──────────────────────────────────────────────────────────────────
BATCHES = {
    1:  {"id": 1,  "batch_uid": "BATCH-A1B2C3D4", "org_id": 1, "devices": [{"device_id": 1,  "name": "Laptop",               "quantity": 50}, {"device_id": 6,  "name": "Monitor (LED)",           "quantity": 20}], "total_devices": 70,  "estimated_weight_kg": 225.0, "epr_credit_estimate": 35.0,  "status": "certified",          "collector_id": 1, "recycler_id": 4, "created_at": "2024-01-20", "collected_at": "2024-01-25", "received_at": "2024-01-28", "certified_at": "2024-02-01"},
    2:  {"id": 2,  "batch_uid": "BATCH-E5F6G7H8", "org_id": 5, "devices": [{"device_id": 8,  "name": "Server Rack Unit",      "quantity": 10}, {"device_id": 9,  "name": "UPS Battery System",      "quantity": 5}],  "total_devices": 15,  "estimated_weight_kg": 325.0, "epr_credit_estimate": 7.5,   "status": "certified",          "collector_id": 3, "recycler_id": 1, "created_at": "2024-01-22", "collected_at": "2024-01-27", "received_at": "2024-01-30", "certified_at": "2024-02-05"},
    3:  {"id": 3,  "batch_uid": "BATCH-I9J0K1L2", "org_id": 3, "devices": [{"device_id": 1,  "name": "Laptop",               "quantity": 100},{"device_id": 3,  "name": "Smartphone",               "quantity": 200},{"device_id": 4, "name": "Tablet", "quantity": 50}], "total_devices": 350, "estimated_weight_kg": 390.0, "epr_credit_estimate": 175.0, "status": "at_recycler",        "collector_id": 3, "recycler_id": 3, "created_at": "2024-02-10", "collected_at": "2024-02-14", "received_at": "2024-02-16", "certified_at": None},
    4:  {"id": 4,  "batch_uid": "BATCH-M3N4O5P6", "org_id": 2, "devices": [{"device_id": 5,  "name": "Printer",              "quantity": 15}, {"device_id": 11, "name": "Television (LED)",         "quantity": 5}],  "total_devices": 20,  "estimated_weight_kg": 165.0, "epr_credit_estimate": 10.0,  "status": "collected",          "collector_id": 2, "recycler_id": None,"created_at": "2024-02-15", "collected_at": "2024-02-19", "received_at": None,         "certified_at": None},
    5:  {"id": 5,  "batch_uid": "BATCH-Q7R8S9T0", "org_id": 6, "devices": [{"device_id": 1,  "name": "Laptop",               "quantity": 30}, {"device_id": 10, "name": "Router / Network Switch",  "quantity": 40}], "total_devices": 70,  "estimated_weight_kg": 135.0, "epr_credit_estimate": 35.0,  "status": "collector_assigned", "collector_id": 3, "recycler_id": None,"created_at": "2024-03-01", "collected_at": None,         "received_at": None,         "certified_at": None},
    6:  {"id": 6,  "batch_uid": "BATCH-U1V2W3X4", "org_id": 7, "devices": [{"device_id": 1,  "name": "Laptop",               "quantity": 20}, {"device_id": 3,  "name": "Smartphone",               "quantity": 50}], "total_devices": 70,  "estimated_weight_kg": 60.0,  "epr_credit_estimate": 35.0,  "status": "pending",            "collector_id": None,"recycler_id": None,"created_at": "2024-03-10", "collected_at": None,         "received_at": None,         "certified_at": None},
    7:  {"id": 7,  "batch_uid": "BATCH-Y5Z6A7B8", "org_id": 8, "devices": [{"device_id": 2,  "name": "Desktop Computer",     "quantity": 40}, {"device_id": 6,  "name": "Monitor (LED)",           "quantity": 40}], "total_devices": 80,  "estimated_weight_kg": 520.0, "epr_credit_estimate": 40.0,  "status": "pending",            "collector_id": None,"recycler_id": None,"created_at": "2024-03-15", "collected_at": None,         "received_at": None,         "certified_at": None},
    8:  {"id": 8,  "batch_uid": "BATCH-C9D0E1F2", "org_id": 1, "devices": [{"device_id": 12, "name": "Air Conditioner",      "quantity": 5}],                                                                          "total_devices": 5,   "estimated_weight_kg": 175.0, "epr_credit_estimate": 2.5,   "status": "certified",          "collector_id": 1, "recycler_id": 4, "created_at": "2024-03-18", "collected_at": "2024-03-22", "received_at": "2024-03-24", "certified_at": "2024-03-28"},
    9:  {"id": 9,  "batch_uid": "BATCH-G3H4I5J6", "org_id": 4, "devices": [{"device_id": 11, "name": "Television (LED)",    "quantity": 8},  {"device_id": 3,  "name": "Smartphone",               "quantity": 30}], "total_devices": 38,  "estimated_weight_kg": 102.0, "epr_credit_estimate": 19.0,  "status": "at_recycler",        "collector_id": 5, "recycler_id": 2, "created_at": "2024-03-20", "collected_at": "2024-03-24", "received_at": "2024-03-26", "certified_at": None},
    10: {"id": 10, "batch_uid": "BATCH-K7L8M9N0", "org_id": 5, "devices": [{"device_id": 1,  "name": "Laptop",               "quantity": 200},{"device_id": 3,  "name": "Smartphone",               "quantity": 500}],"total_devices": 700, "estimated_weight_kg": 600.0, "epr_credit_estimate": 350.0, "status": "collector_assigned", "collector_id": 4, "recycler_id": None,"created_at": "2024-03-22", "collected_at": None,         "received_at": None,         "certified_at": None},
}

# ─── CERTIFICATES ─────────────────────────────────────────────────────────────
CERTIFICATES = {
    1: {"id": 1, "certificate_uid": "CERT-9A8B7C6D", "batch_id": 1, "org_id": 1, "collector_id": 1, "recycler_id": 4, "weight_kg": 225.0, "copper_recovered_kg": 3.8,  "gold_recovered_g": 12.5, "devices_refurbished": 15, "co2_avoided_kg": 1125.0, "issued_at": "2024-02-01"},
    2: {"id": 2, "certificate_uid": "CERT-5E4F3G2H", "batch_id": 2, "org_id": 5, "collector_id": 3, "recycler_id": 1, "weight_kg": 325.0, "copper_recovered_kg": 8.2,  "gold_recovered_g": 5.1,  "devices_refurbished": 3,  "co2_avoided_kg": 1625.0, "issued_at": "2024-02-05"},
    3: {"id": 3, "certificate_uid": "CERT-1I0J9K8L", "batch_id": 8, "org_id": 1, "collector_id": 1, "recycler_id": 4, "weight_kg": 175.0, "copper_recovered_kg": 5.5,  "gold_recovered_g": 3.2,  "devices_refurbished": 0,  "co2_avoided_kg": 875.0,  "issued_at": "2024-03-28"},
    4: {"id": 4, "certificate_uid": "CERT-2P1Q0R9S", "batch_id": 2, "org_id": 5, "collector_id": 3, "recycler_id": 1, "weight_kg": 120.0, "copper_recovered_kg": 2.1,  "gold_recovered_g": 1.8,  "devices_refurbished": 8,  "co2_avoided_kg": 600.0,  "issued_at": "2024-02-20"},
    5: {"id": 5, "certificate_uid": "CERT-8T7U6V5W", "batch_id": 1, "org_id": 1, "collector_id": 1, "recycler_id": 4, "weight_kg": 90.0,  "copper_recovered_kg": 1.4,  "gold_recovered_g": 0.9,  "devices_refurbished": 12, "co2_avoided_kg": 450.0,  "issued_at": "2024-03-10"},
    6: {"id": 6, "certificate_uid": "CERT-4X3Y2Z1A", "batch_id": 8, "org_id": 1, "collector_id": 1, "recycler_id": 4, "weight_kg": 280.0, "copper_recovered_kg": 9.3,  "gold_recovered_g": 8.7,  "devices_refurbished": 20, "co2_avoided_kg": 1400.0, "issued_at": "2024-04-01"},
}

# ─── COUNTERS (for auto-increment IDs) ────────────────────────────────────────
_org_counter    = max(ORGANISATIONS.keys()) + 1
_batch_counter  = max(BATCHES.keys()) + 1
_col_counter    = max(COLLECTORS.keys()) + 1
_rec_counter    = max(RECYCLERS.keys()) + 1
_cert_counter   = max(CERTIFICATES.keys()) + 1

def next_org_id():
    global _org_counter; _org_counter += 1; return _org_counter - 1

def next_batch_id():
    global _batch_counter; _batch_counter += 1; return _batch_counter - 1

def next_col_id():
    global _col_counter; _col_counter += 1; return _col_counter - 1

def next_rec_id():
    global _rec_counter; _rec_counter += 1; return _rec_counter - 1

def next_cert_id():
    global _cert_counter; _cert_counter += 1; return _cert_counter - 1

# ─── GLOBAL IMPACT TOTALS ─────────────────────────────────────────────────────
def get_impact_totals():
    total_weight  = sum(b["estimated_weight_kg"] for b in BATCHES.values() if b["status"] in ("certified","at_recycler","collected"))
    total_devices = sum(b["total_devices"]      for b in BATCHES.values())
    total_co2     = sum(c["co2_avoided_kg"]     for c in CERTIFICATES.values())
    total_copper  = sum(c["copper_recovered_kg"] for c in CERTIFICATES.values())
    total_gold    = sum(c["gold_recovered_g"]   for c in CERTIFICATES.values())
    return {
        "total_weight_kg":        round(total_weight, 2),
        "total_devices_recycled": total_devices,
        "co2_avoided_kg":         round(total_co2, 2),
        "copper_recovered_kg":    round(total_copper, 2),
        "gold_recovered_g":       round(total_gold, 2),
        "certificates_issued":    len(CERTIFICATES),
        "batches_total":          len(BATCHES),
        "orgs_registered":        len(ORGANISATIONS),
        "collectors_active":      sum(1 for c in COLLECTORS.values() if c["is_available"]),
        "recyclers_active":       sum(1 for r in RECYCLERS.values() if r["is_available"]),
    }
