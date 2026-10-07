import pytest

def test_explain_valid_select(client):
    response = client.post("/api/explain", json={"query": "SELECT * FROM users"})
    assert response.status_code == 200
    data = response.json()
    assert data["plan"]["node_type"] == "Seq Scan"
    assert data["plan"]["relation"] == "test_table"

def test_explain_valid_with(client):
    response = client.post("/api/explain", json={"query": "WITH a AS (SELECT 1) SELECT * FROM a"})
    assert response.status_code == 200

def test_explain_rejects_multiple_statements(client):
    response = client.post("/api/explain", json={"query": "SELECT * FROM a; SELECT * FROM b;"})
    assert response.status_code == 400
    assert "Multiple statements" in response.json()["detail"]

def test_explain_rejects_drop_table(client):
    response = client.post("/api/explain", json={"query": "DROP TABLE users"})
    assert response.status_code == 400
    assert "Only SELECT and WITH" in response.json()["detail"]

def test_explain_rejects_update(client):
    response = client.post("/api/explain", json={"query": "UPDATE users SET name = 'test'"})
    assert response.status_code == 400
    assert "Only SELECT and WITH" in response.json()["detail"]

def test_explain_rejects_explain_prefix(client):
    response = client.post("/api/explain", json={"query": "EXPLAIN SELECT * FROM users"})
    assert response.status_code == 400
    assert "Only SELECT and WITH" in response.json()["detail"]

def test_explain_query_too_long(client):
    long_query = "SELECT " + "a" * 10001
    response = client.post("/api/explain", json={"query": long_query})
    assert response.status_code == 400
    assert "maximum length" in response.json()["detail"]
