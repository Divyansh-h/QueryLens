import pytest

def test_get_slow_queries(client):
    response = client.get("/api/slow-queries?sort_by=total_time&limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "queries" in data
    assert len(data["queries"]) == 1
    assert data["queries"][0]["calls"] == 50
    assert data["queries"][0]["total_time"] == 100.0

def test_get_slow_queries_invalid_sort(client):
    response = client.get("/api/slow-queries?sort_by=invalid")
    assert response.status_code == 400

def test_reset_stats(client):
    response = client.post("/api/reset-stats")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"
