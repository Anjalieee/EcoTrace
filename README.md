# EcoTrace — E-Waste Lifecycle Management Platform

EcoTrace is a comprehensive full-stack system designed to streamline India's EPR (Extended Producer Responsibility) compliance for e-waste. It connects bulk consumers, collectors (PROs/aggregators), and recyclers in a transparent, efficient network.

## 📋 Project Overview

### Goal
Facilitate end-to-end e-waste management with:
- **Bulk Consumers** (M0): Submit e-waste batches, track EPR credits
- **Collectors** (M1-M2): Pick up batches, manage capacity, assign to recyclers
- **Recyclers** (M2-M3): Process e-waste, issue EPR certificates, track impact

### Tech Stack
- **Backend**: FastAPI (Python) + MySQL
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Algorithms**: 11 DSA implementations for optimization

---

## 🏗️ Project Structure

```
ecotrace/
├── frontend/                 # React Vite app
│   ├── src/
│   │   ├── components/
│   │   │   ├── bulk-consumer/     # Portal 1: Org registration, batch submission
│   │   │   ├── collector/         # Portal 2A: Batch assignment, collection
│   │   │   └── recycler/          # Portal 2B: Processing, certification
│   │   ├── pages/
│   │   ├── utils/                 # API client, helpers
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── backend/                  # FastAPI Python
│   ├── dsa/                  # Data Structure & Algorithm implementations
│   │   ├── trie.py           # Device name autocomplete
│   │   ├── kd_tree.py        # Nearest collector/recycler search
│   │   ├── decision_tree.py  # Device triage (refurbishable/recyclable/hazardous)
│   │   ├── bst.py            # EPR credit range queries
│   │   ├── max_heap.py       # Batch priority queue
│   │   ├── greedy.py         # Batch-to-collector assignment
│   │   ├── bfs.py            # Shortest path through network
│   │   ├── sliding_window.py # Time-series trend analysis
│   │   ├── hungarian.py      # Optimal assignment (cost minimization)
│   │   ├── max_flow.py       # Capacity planning
│   │   └── kmeans.py         # Geographic clustering
│   ├── routes/
│   │   ├── bulk_consumer.py  # Org registration, batch creation
│   │   ├── collector.py      # Batch assignment, collection
│   │   └── recycler.py       # Processing, certification
│   ├── models/
│   │   ├── user.py
│   │   ├── batch.py
│   │   └── certificate.py
│   ├── db/
│   │   └── connection.py     # MySQL connection pool
│   ├── main.py               # FastAPI app setup
│   ├── requirements.txt
│   └── .env                  # Database credentials
│
├── database/
│   └── schema.sql            # Full schema with all tables
│
└── README.md
```

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+
- Node.js 16+
- MySQL 5.7+
- Git

### 1. Database Setup

```bash
# In MySQL terminal:
mysql -u root -p ecotrace < database/schema.sql
```

### 2. Backend Setup

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt

# Update .env with your MySQL credentials
# Then start the server:
uvicorn main:app --reload
# Running at http://localhost:8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:5173
```

---

## 📊 Database Schema Overview

### Core Tables

| Table | Purpose |
|-------|---------|
| `organisations` | Bulk consumers (companies, hospitals, colleges) |
| `collectors` | PROs/aggregators who pick up e-waste |
| `recyclers` | Facilities that process e-waste |
| `devices` | Master list of e-waste device types & properties |
| `batches` | Collections of e-waste from an organisation |
| `certificates` | EPR certificates issued after recycling |
| `impact_log` | City-level environmental impact metrics |

---

## 🧠 DSA Usage Map

| Algorithm | Use Case | File |
|-----------|----------|------|
| **Trie** | Device name autocomplete in batch forms | `dsa/trie.py` |
| **K-D Tree** | Find nearest collectors/recyclers by GPS | `dsa/kd_tree.py` |
| **Decision Tree** | Auto-classify devices (refurbish/recycle/hazard) | `dsa/decision_tree.py` |
| **Binary Search Tree** | Query EPR credits by date range | `dsa/bst.py` |
| **Max Heap** | Priority queue of batches (weight-based) | `dsa/max_heap.py` |
| **Greedy** | Assign batches to collectors (minimize distance) | `dsa/greedy.py` |
| **BFS** | Find shortest network path batch→collector→recycler | `dsa/bfs.py` |
| **Sliding Window** | Moving averages of kg diverted, EPR credits | `dsa/sliding_window.py` |
| **Hungarian** | Optimal batch-to-facility assignment (cost) | `dsa/hungarian.py` |
| **Max Flow** | Verify all batches can be processed (capacity) | `dsa/max_flow.py` |
| **K-Means** | Geographic clustering of facilities | `dsa/kmeans.py` |

---

## 🔄 Feature Rollout Plan

### **M0: MVP (This Sprint)**
- ✅ Backend: Organisation registration, batch creation
- ✅ Frontend: Registration form + batch form UI
- ✅ DSA: Trie (device autocomplete)
- Database: Schema loaded

### **M1: Collector Portal (Next Sprint)**
- Collector registration
- Available batch list with K-D Tree search
- Batch assignment (Greedy + Hungarian)
- Pickup confirmation

### **M2: Recycler Portal**
- Recycler registration
- Batch intake & processing
- Decision Tree for device triage
- Certificate generation

### **M3: Analytics Dashboard**
- Sliding Window for trend analysis
- BST for EPR credit queries
- K-Means for geographic insights
- Environmental impact metrics

### **M4: Integration & Polish**
- Batch tracking across full lifecycle
- Real-time notifications
- Compliance reports for government

---

## 📡 API Endpoints

### Bulk Consumer
- `POST /api/bulk-consumer/register` — Register organisation
- `POST /api/bulk-consumer/batch/create` — Submit e-waste batch
- `GET /api/bulk-consumer/org/{org_id}/batches` — View all batches
- `GET /api/bulk-consumer/batch/{batch_id}` — Batch details

### Collector
- `POST /api/collector/register` — Register collector
- `GET /api/collector/available/{city}` — Available collectors in city
- `PATCH /api/collector/batch/{batch_id}/assign` — Assign batch to collector
- `PATCH /api/collector/batch/{batch_id}/collect` — Confirm pickup

### Recycler
- `POST /api/recycler/register` — Register recycler
- `PATCH /api/recycler/batch/{batch_id}/receive` — Mark batch received
- `POST /api/recycler/certificate/issue` — Issue EPR certificate
- `GET /api/recycler/certificate/{cert_id}` — Certificate details

---

## 🔑 Key Design Decisions

1. **MySQL over PostgreSQL**: Simplicity + familiarity. JSON columns for flexibility.
2. **FastAPI**: Modern Python web framework, auto OpenAPI docs.
3. **React + Vite**: Fast dev loop, Tailwind for rapid UI.
4. **11 DSA Implementations**: Educational + production-ready optimizations.
5. **Separate Portals**: Clear separation of concerns (bulk consumer vs. collector vs. recycler).

---

## 🛠️ Development Workflow

### Git Branches
```bash
# Create feature branch
git checkout -b feature/bulk-consumer-portal

# Commit regularly
git add .
git commit -m "feat: add organisation registration"

# Push to origin
git push origin feature/bulk-consumer-portal

# Create PR, review, merge to main
```

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

---

## 📝 Notes for Team

1. **Database Credentials**: Update `.env` in backend with your MySQL password before first run.
2. **Frontend API URL**: Configured in `frontend/vite.config.js` to proxy `/api` calls to `http://localhost:8000`.
3. **Device Master List**: Must be seeded with real e-waste device data (weight, material composition, hazard tier).
4. **Location Data**: For production, integrate with Google Maps API for real lat/lng.

---

## 📞 Contact & Support

- **Architecture Questions**: Review `preface.md` for design rationale.
- **API Issues**: Check FastAPI docs at `http://localhost:8000/docs` (auto-generated).
- **Frontend Build Errors**: Clear node_modules and reinstall: `rm -rf node_modules && npm install`.

---

## 🎯 Success Metrics

- ✅ All 3 portals functional and integrated
- ✅ 11 DSA algorithms properly implemented & tested
- ✅ Database queries optimized (< 200ms for most operations)
- ✅ Full e2e flow: Batch registration → Collector pickup → Recycler processing → Certificate
- ✅ Beautiful, responsive UI (mobile-first design)

---

**Built with ❤️ for sustainable e-waste management in India.**


##  Techstack
- Frontend: React (Vite + Tailwind)
- Backend: FastAPI (Python)
- Database: MySQL
- Algorithms: Custom DSA implementations

##  Project Structure
EcoTrace/
├── frontend/
├── backend/
├── database/


## ⚙️ Setup (Planned)
```bash
pip install -r backend/requirements.txt
uvicorn backend.main:app --reload
📌 Status

🚧 Currently in development — architecture and system design completed.

👩‍💻 Author

 Anjalieee


