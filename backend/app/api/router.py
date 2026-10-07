import re
from fastapi import APIRouter, Depends, HTTPException, Request
from psycopg import AsyncConnection
from app.db import get_db_connection, get_admin_connection
from fastapi import Query
from app.limiter import limiter
from app.schemas import (
    ExplainRequest, ExplainResponse, PlanNode, SuggestIndexesResponse,
    SlowQueriesResponse, SlowQueryItem, ResetStatsResponse,
    ApplyIndexRequest, ApplyIndexResponse, DropIndexRequest,
    AnalyzePlanRequest
)
from app.analyzer import analyze_plan
from app.suggester import suggest_indexes

api_router = APIRouter()

@api_router.get("/health")
async def health_check(conn: AsyncConnection = Depends(get_admin_connection)):
    """Health check endpoint that verifies DB connectivity."""
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT 1")
            result = await cur.fetchone()
        
        return {
            "status": "ok",
            "database": "connected" if result and result[0] == 1 else "error"
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "details": str(e)
        }

@api_router.get("/ping")
async def ping():
    """Lightweight endpoint for uptime monitors to prevent cold starts."""
    return {"status": "ok", "message": "pong"}

def validate_query(query: str) -> str:
    if len(query) > 10000:
        raise ValueError("Query exceeds maximum length of 10000 characters")
        
    # Remove single and multi-line comments for safety checks
    clean_q = re.sub(r'--.*', '', query)
    clean_q = re.sub(r'/\*.*?\*/', '', clean_q, flags=re.DOTALL).strip()
    
    statements = [s for s in clean_q.split(';') if s.strip()]
    if len(statements) > 1:
        raise ValueError("Multiple statements are not allowed")
        
    if not statements:
        raise ValueError("Empty query")
        
    first_word = statements[0].strip().split()[0].upper()
    if first_word not in ('SELECT', 'WITH'):
        raise ValueError(f"Only SELECT and WITH queries are allowed. Found: {first_word}")
        
    return statements[0].strip()

def parse_plan_node(node: dict) -> PlanNode:
    children = []
    if "Plans" in node:
        children = [parse_plan_node(child) for child in node["Plans"]]
        
    buffers = {
        "shared_hit": node.get("Shared Hit Blocks", 0),
        "shared_read": node.get("Shared Read Blocks", 0),
        "shared_dirtied": node.get("Shared Dirtied Blocks", 0),
        "shared_written": node.get("Shared Written Blocks", 0),
        "local_hit": node.get("Local Hit Blocks", 0),
        "local_read": node.get("Local Read Blocks", 0),
        "local_dirtied": node.get("Local Dirtied Blocks", 0),
        "local_written": node.get("Local Written Blocks", 0),
        "temp_read": node.get("Temp Read Blocks", 0),
        "temp_written": node.get("Temp Written Blocks", 0),
    }
    # Filter out 0 buffers for cleaner response
    buffers = {k: v for k, v in buffers.items() if v > 0}
    
    return PlanNode(
        node_type=node.get("Node Type", "Unknown"),
        relation=node.get("Relation Name") or node.get("Index Name"),
        cost=node.get("Total Cost", 0.0),
        estimated_rows=node.get("Plan Rows", 0.0),
        actual_rows=node.get("Actual Rows"),
        actual_time=node.get("Actual Total Time"),
        loops=node.get("Actual Loops"),
        buffers=buffers if buffers else None,
        children=children
    )

@api_router.post("/explain", response_model=ExplainResponse)
@limiter.limit("20/minute")
async def explain_query(request: Request, body: ExplainRequest, conn: AsyncConnection = Depends(get_db_connection)):
    """Runs EXPLAIN ANALYZE on a query and parses the result into a normalized tree."""
    try:
        validated_query = validate_query(body.query)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        # Enforce read-only transaction and strict timeout (10 seconds)
        await conn.execute("SET TRANSACTION READ ONLY")
        await conn.execute("SET LOCAL statement_timeout = 10000")
        
        explain_sql = f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {validated_query}"
        
        async with conn.cursor() as cur:
            await cur.execute(explain_sql)
            result = await cur.fetchone()
    except Exception as e:
        await conn.rollback()
        raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")
    finally:
        # ALWAYS rollback the transaction to prevent side effects of INSERT/UPDATE/DELETE during EXPLAIN ANALYZE
        await conn.rollback()
        
    if not result or not result[0]:
        raise HTTPException(status_code=500, detail="Failed to get explain plan")
        
    # Postgres JSON returns a list containing the root plan dictionary
    raw_plan_data = result[0][0] if isinstance(result[0], list) else result[0]
    
    if "Plan" not in raw_plan_data:
        raise HTTPException(status_code=500, detail="Invalid explain plan format")
        
    plan = parse_plan_node(raw_plan_data["Plan"])
    execution_time = raw_plan_data.get("Execution Time")
    findings = analyze_plan(raw_plan_data["Plan"])
    
    return ExplainResponse(
        plan=plan,
        raw_plan=raw_plan_data,
        execution_time=execution_time,
        findings=findings
    )

@api_router.post("/suggest-indexes", response_model=SuggestIndexesResponse)
async def suggest_indexes_endpoint(request: ExplainRequest, conn: AsyncConnection = Depends(get_db_connection)):
    """Analyzes a query's execution plan and suggests indexes based on filters, sorts, and joins."""
    try:
        validated_query = validate_query(request.query)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        await conn.execute("SET TRANSACTION READ ONLY")
        await conn.execute("SET LOCAL statement_timeout = 10000")
        
        explain_sql = f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {validated_query}"
        
        async with conn.cursor() as cur:
            await cur.execute(explain_sql)
            result = await cur.fetchone()
    except Exception as e:
        await conn.rollback()
        raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")
    finally:
        await conn.rollback()
        
    if not result or not result[0]:
        raise HTTPException(status_code=500, detail="Failed to get explain plan")
        
    raw_plan_data = result[0][0] if isinstance(result[0], list) else result[0]
    
    if "Plan" not in raw_plan_data:
        raise HTTPException(status_code=500, detail="Invalid explain plan format")
        
    suggestions = suggest_indexes(raw_plan_data["Plan"])
    return SuggestIndexesResponse(suggestions=suggestions)

@api_router.get("/slow-queries", response_model=SlowQueriesResponse)
async def get_slow_queries(
    sort_by: str = Query("total_time", description="Field to sort by: total_time, mean_time, max_time, calls"),
    limit: int = Query(50, ge=1, le=1000, description="Number of queries to return"),
    conn: AsyncConnection = Depends(get_db_connection)
):
    """Fetches historical query performance metrics from pg_stat_statements."""
    allowed_sorts = {"total_time": "total_exec_time", "mean_time": "mean_exec_time", "max_time": "max_exec_time", "calls": "calls"}
    if sort_by not in allowed_sorts:
        raise HTTPException(status_code=400, detail=f"Invalid sort parameter. Allowed: {list(allowed_sorts.keys())}")
        
    order_col = allowed_sorts[sort_by]
    
    sql = f"""
        SELECT 
            query, 
            calls, 
            total_exec_time as total_time, 
            mean_exec_time as mean_time, 
            max_exec_time as max_time, 
            rows
        FROM pg_stat_statements
        WHERE query NOT LIKE '%%pg_stat_statements%%'
        ORDER BY {order_col} DESC
        LIMIT %s
    """
    
    try:
        async with conn.cursor() as cur:
            await cur.execute(sql, (limit,))
            rows = await cur.fetchall()
            
        queries = [
            SlowQueryItem(
                query=r[0], calls=r[1], total_time=r[2], 
                mean_time=r[3], max_time=r[4], rows=r[5]
            ) for r in rows
        ]
        return SlowQueriesResponse(queries=queries)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch slow queries: {str(e)}")

@api_router.post("/reset-stats", response_model=ResetStatsResponse)
async def reset_stats(conn: AsyncConnection = Depends(get_admin_connection)):
    """Resets the pg_stat_statements statistics back to zero."""
    try:
        async with conn.cursor() as cur:
            await cur.execute("SELECT pg_stat_statements_reset()")
        await conn.commit()
        return ResetStatsResponse(status="ok", message="Query statistics reset successfully")
    except Exception as e:
        await conn.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to reset statistics: {str(e)}")

@api_router.post("/indexes/apply", response_model=ApplyIndexResponse)
async def apply_index(request: ApplyIndexRequest, conn: AsyncConnection = Depends(get_admin_connection)):
    """Creates a real index and returns the new EXPLAIN ANALYZE performance."""
    if not request.statement.strip().lower().startswith("create index"):
        raise HTTPException(status_code=400, detail="Only CREATE INDEX is allowed.")
    
    from app.analyzer import parse_plan_node
    
    try:
        validated_query = validate_query(request.query)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    try:
        await conn.execute(request.statement)
        await conn.commit()
        
        await conn.execute("SET LOCAL statement_timeout = 10000")
        explain_sql = f"EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) {validated_query}"
        async with conn.cursor() as cur:
            await cur.execute(explain_sql)
            result = await cur.fetchone()
            
        raw_plan = result[0][0] if isinstance(result[0], list) else result[0]
        exec_time = raw_plan.get("Execution Time", 0.0)
        
        plan_node = parse_plan_node(raw_plan["Plan"])
        
        return ApplyIndexResponse(
            execution_time=exec_time,
            plan=plan_node,
            raw_plan=raw_plan
        )
    except Exception as e:
        await conn.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to apply index: {str(e)}")

@api_router.post("/indexes/drop")
async def drop_index(request: DropIndexRequest, conn: AsyncConnection = Depends(get_admin_connection)):
    """Drops the specified index."""
    try:
        await conn.execute(f"DROP INDEX IF EXISTS {request.index_name}")
        await conn.commit()
        return {"status": "ok"}
    except Exception as e:
        await conn.rollback()
        raise HTTPException(status_code=400, detail=f"Failed to drop index: {str(e)}")

@api_router.post("/run-workload")
async def run_workload(conn: AsyncConnection = Depends(get_admin_connection)):
    """Runs a few slow queries to populate pg_stat_statements."""
    queries = [
        "SELECT COUNT(*) FROM orders WHERE status = 'PENDING';",
        """SELECT c.first_name, c.last_name, sum(o.total_amount)
           FROM customers c
           JOIN orders o ON c.id = o.customer_id
           GROUP BY c.id
           ORDER BY sum(o.total_amount) DESC
           LIMIT 100;""",
        """SELECT p.category, count(oi.id) as items_sold, sum(oi.quantity * oi.unit_price) as revenue
           FROM products p
           JOIN order_items oi ON p.id = oi.product_id
           JOIN orders o ON o.id = oi.order_id
           WHERE o.order_date > NOW() - INTERVAL '1 year'
           GROUP BY p.category
           ORDER BY revenue DESC;""",
        "SELECT * FROM customers WHERE email LIKE '%@example.com' AND first_name LIKE '%5%';"
    ]
    try:
        await conn.execute("SET LOCAL statement_timeout = 60000")
        for _ in range(5):
            for q in queries:
                await conn.execute(q)
        await conn.commit()
        return {"status": "ok"}
    except Exception as e:
        await conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analyze-plan", response_model=ExplainResponse)
async def analyze_pasted_plan(request: AnalyzePlanRequest):
    try:
        if isinstance(request.raw_plan, list):
            raw = request.raw_plan[0]
        else:
            raw = request.raw_plan
            
        if "Plan" not in raw:
            raise ValueError("No 'Plan' node found in JSON. Did you run EXPLAIN (FORMAT JSON)?")
            
        from app.analyzer import parse_plan_node, analyze_plan
        plan_node = parse_plan_node(raw["Plan"])
        findings = analyze_plan(plan_node)
        exec_time = raw.get("Execution Time", 0.0)
        
        return ExplainResponse(
            plan=plan_node,
            raw_plan=raw,
            execution_time=exec_time,
            findings=findings
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/dataset-status")
async def dataset_status(conn: AsyncConnection = Depends(get_db_connection)):
    try:
        await conn.execute("SET LOCAL statement_timeout = 2000")
        res = await conn.execute("SELECT (SELECT count(*) FROM order_items) > 0 as ready")
        row = await res.fetchone()
        return {"ready": row[0] if row else False}
    except Exception:
        return {"ready": False}
