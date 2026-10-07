from psycopg_pool import AsyncConnectionPool
from app.config import settings

# Global pool instance
pool: AsyncConnectionPool | None = None

async def get_db_pool() -> AsyncConnectionPool:
    if pool is None:
        raise RuntimeError("Database pool is not initialized")
    return pool

async def get_db_connection():
    """Dependency for FastAPI endpoints to get a connection from the pool."""
    if pool is None:
        raise RuntimeError("Database pool is not initialized")
    
    async with pool.connection() as conn:
        yield conn
