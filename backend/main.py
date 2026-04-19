from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="EcoTrace API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Route imports (will be added once route files are created)
# from routes import bulk_consumer, collector, recycler
# app.include_router(bulk_consumer.router, prefix="/api/bulk-consumer", tags=["Bulk Consumer"])
# app.include_router(collector.router, prefix="/api/collector", tags=["Collector"])
# app.include_router(recycler.router, prefix="/api/recycler", tags=["Recycler"])

@app.get("/")
def root():
    return {"status": "EcoTrace API running", "version": "1.0.0"}