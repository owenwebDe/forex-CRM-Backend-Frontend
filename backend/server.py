from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routers
from routers import auth, mt5, payments, charts, users, documents, tickets, admin

# Database connection
from database import connect_to_mongo, close_mongo_connection

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(
    title="CRIB Markets API",
    description="Backend API for CRIB Markets Trading Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://localhost:3000",
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(mt5.router, prefix="/api/mt5", tags=["MT5 Trading"])
app.include_router(payments.router, prefix="/api/payments", tags=["Payments"])
app.include_router(charts.router, prefix="/api/charts", tags=["Charts & Analytics"])
app.include_router(users.router, prefix="/api/user", tags=["User Management"])
app.include_router(documents.router, prefix="/api/documents", tags=["Document Management"])
app.include_router(tickets.router, prefix="/api/tickets", tags=["Support Tickets"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {"message": "CRIB Markets API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)