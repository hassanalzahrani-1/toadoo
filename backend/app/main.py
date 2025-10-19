"""FastAPI application entry point."""
import logging
import os
import pathlib

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.db import create_tables
from app.middleware import RequestLoggingMiddleware
from app.routers import todos, auth, users, admin
from app.dependencies.rate_limit import limiter

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
)

# Add rate limiter state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add custom middleware
app.add_middleware(RequestLoggingMiddleware)

# Include routers
app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(todos.router, prefix="/api")
app.include_router(admin.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    """Initialize database tables on startup."""
    logger.info("Starting up Toadoo API...")
    
    # Extract the database path from the URL
    db_url = settings.DATABASE_URL
    if db_url.startswith("sqlite:///"):
        # Remove the sqlite:/// prefix
        db_path = db_url.replace("sqlite:///", "")
        
        # Handle relative paths
        if db_path.startswith("./"):
            db_path = db_path[2:]
        
        # Convert to absolute path if needed
        if not os.path.isabs(db_path):
            db_path = os.path.join(os.getcwd(), db_path)
        
        # Check if the database file exists
        if os.path.exists(db_path):
            logger.info(f"Using existing database at {db_path}")
        else:
            # Create parent directories if they don't exist
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
            logger.info(f"Creating new database at {db_path}")
            create_tables()
            logger.info("Database tables created successfully")
    else:
        # For non-SQLite databases, always run create_tables
        # (it's safe as it only creates tables if they don't exist)
        create_tables()
        logger.info("Database tables created successfully")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Toadoo API...")


@app.get("/", tags=["health"])
async def root():
    """Root endpoint for health check."""
    return {
        "message": "Welcome to Toadoo API! 🐸",
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "redoc": "/redoc",
    }


@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "toadoo-api", "version": settings.APP_VERSION}
