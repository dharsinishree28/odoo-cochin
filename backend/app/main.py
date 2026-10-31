from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import init_db
from app.seed import seed_database
from app.routers import auth, catalog, quotations, subscriptions, billing, analytics

app = FastAPI(
    title="Brightloop Software - Subscription Management Platform",
    description="Subscription-based quotation and offers management system with Admin, Staff, and Customer portals.",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event: Initialize SQLite database & Seed with Brightloop data
@app.on_event("startup")
def on_startup():
    init_db()
    seed_database()

# Include Routers
app.include_router(auth.router)
app.include_router(catalog.router)
app.include_router(quotations.router)
app.include_router(subscriptions.router)
app.include_router(billing.router)
app.include_router(analytics.router)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "Brightloop Software Subscription & Billing API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
