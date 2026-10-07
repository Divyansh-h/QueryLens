import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db import get_db_connection

class MockConnection:
    class MockCursor:
        def __init__(self):
            self.query_text = ""
            
        async def execute(self, query, params=None):
            self.query_text = query
            
        async def fetchone(self):
            if "pg_stat_statements_reset" in self.query_text:
                return (True,)
                
            plan = {
                "Plan": {
                    "Node Type": "Seq Scan",
                    "Relation Name": "test_table",
                    "Total Cost": 10.0,
                    "Plan Rows": 100,
                    "Actual Rows": 50,
                    "Actual Total Time": 1.5,
                    "Actual Loops": 1
                },
                "Execution Time": 1.6
            }
            return ([plan],)
            
        async def fetchall(self):
            return [
                ("SELECT * FROM test", 50, 100.0, 2.0, 5.0, 1000)
            ]
            
        async def __aenter__(self):
            return self
            
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            pass
            
    async def execute(self, query):
        pass

    async def rollback(self):
        pass
        
    async def commit(self):
        pass

    def cursor(self):
        return self.MockCursor()

async def override_get_db_connection():
    yield MockConnection()

@pytest.fixture
def client():
    app.dependency_overrides[get_db_connection] = override_get_db_connection
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
