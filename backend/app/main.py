from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
import os
import logging

from app.config import settings
import app.db as db
from app.api.router import api_router
from app.limiter import limiter

from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the DB connection pools
    logger.info("Initializing database pools...")
    await db.init_pools()
    
    yield
    
    # Shutdown: Close the DB connection pools
    logger.info("Closing database pools...")
    await db.close_pools()

def create_app() -> FastAPI:
    app = FastAPI(
        title="QueryLens API",
        description="Backend for PostgreSQL query optimization tool",
        version="0.1.0",
        lifespan=lifespan,
    )

    # Set up Rate Limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    # Configure CORS
    origins = [o.strip() for o in settings.allowed_origins.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Structured error handling
    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled error on {request.url}: {exc}", exc_info=True)
        return JSONResponse(
            status_code=500,
            content={
                "message": "Internal Server Error", 
                "details": str(exc) if settings.debug else "An unexpected error occurred."
            }
        )

    # Include routers
    app.include_router(api_router, prefix="/api")

    # Serve frontend static files in production
    STATIC_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static")
    if os.path.exists(STATIC_DIR):
        app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")
        
        @app.get("/{full_path:path}")
        async def catch_all(full_path: str):
            target_path = os.path.join(STATIC_DIR, full_path)
            if os.path.isfile(target_path):
                return FileResponse(target_path)
            return FileResponse(os.path.join(STATIC_DIR, "index.html"))

    return app

app = create_app()
