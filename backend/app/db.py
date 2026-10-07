from psycopg_pool import AsyncConnectionPool
from app.config import settings

ro_pool: AsyncConnectionPool | None = None
admin_pool: AsyncConnectionPool | None = None

async def init_pools():
    global ro_pool, admin_pool
    ro_pool = AsyncConnectionPool(
        conninfo=settings.database_url,
        min_size=1,
        max_size=10,
        timeout=5.0,
        kwargs={"autocommit": True}
    )
    admin_pool = AsyncConnectionPool(
        conninfo=settings.admin_database_url,
        min_size=1,
        max_size=5,
        timeout=5.0,
        kwargs={"autocommit": True}
    )

async def close_pools():
    if ro_pool:
        await ro_pool.close()
    if admin_pool:
        await admin_pool.close()

async def get_db_connection():
    """Dependency for FastAPI endpoints to get a connection from the RO pool."""
    if ro_pool is None:
        raise RuntimeError("Database pool is not initialized")
    
    async with ro_pool.connection() as conn:
        yield conn

async def get_admin_connection():
    """Dependency for FastAPI endpoints to get a connection from the Admin pool."""
    if admin_pool is None:
        raise RuntimeError("Admin pool is not initialized")
    
    async with admin_pool.connection() as conn:
        yield conn
