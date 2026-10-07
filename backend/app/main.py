from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

from app.config import settings
import app.db as db
from psycopg_pool import AsyncConnectionPool
from app.api.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize the DB connection pool
    logger.info("Initializing database pool...")
    db.pool = AsyncConnectionPool(conninfo=settings.database_url, open=False)
    await db.pool.open()
    
    yield
    
    # Shutdown: Close the DB connection pool
    logger.info("Closing database pool...")
    if db.pool:
        await db.pool.close()

def create_app() -> FastAPI:
    app = FastAPI(
        title="QueryLens API",
        description="Backend for PostgreSQL query optimization tool",
        version="0.1.0",
        lifespan=lifespan,
    )

    # Configure CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            settings.vite_api_base_url, 
            "http://localhost:5173", 
            "http://localhost:3000"
        ],
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

    return app

app = create_app()
