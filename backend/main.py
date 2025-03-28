from fastapi import FastAPI

app = FastAPI(title="Personal Finance Tracker API")

@app.get("/")
async def read_root():
    return {"message": "Welcome to the Personal Finance Tracker API!"}

# Tu budeme neskôr pridávať routre pre autentifikáciu, transakcie, atď.