from app.suggester import suggest_indexes, extract_cols

def test_extract_cols():
    assert extract_cols("(amount > 100)") == ["amount"]
    assert extract_cols("((status = 'PENDING'::text) AND (total_amount > 50.0))") == ["status", "total_amount"]
    
def test_suggest_indexes_filter_sort():
    raw_plan = {
        "Node Type": "Seq Scan",
        "Relation Name": "orders",
        "Filter": "(customer_id = 123)",
        "Sort Key": ["order_date DESC"]
    }
    suggs = suggest_indexes(raw_plan)
    # Should have a composite index (rank 1) and a single filter index (rank 2)
    assert len(suggs) == 2
    assert "idx_orders_composite" in suggs[0].statement
    assert "customer_id, order_date" in suggs[0].statement
    assert "idx_orders_customer_id" in suggs[1].statement
    
def test_suggest_indexes_join():
    raw_plan = {
        "Node Type": "Hash Join",
        "Hash Cond": "(users.id = orders.customer_id)",
        "Plans": [
            {"Node Type": "Seq Scan", "Relation Name": "users"},
            {"Node Type": "Seq Scan", "Relation Name": "orders"}
        ]
    }
    suggs = suggest_indexes(raw_plan)
    # Rank 1 joins
    assert len(suggs) == 2
    assert any("idx_users_id_join" in s.statement for s in suggs)
    assert any("idx_orders_customer_id_join" in s.statement for s in suggs)
