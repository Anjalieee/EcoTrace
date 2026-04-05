from fastapi import FastAPI

app = FastAPI(title="EcoTrace API")

@app.get("/")
def root():
    return {"message": "EcoTrace backend running"}