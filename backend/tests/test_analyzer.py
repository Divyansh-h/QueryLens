from app.analyzer import analyze_plan

def test_analyze_seq_scan():
    raw_plan = {
        "Node Type": "Seq Scan",
        "Relation Name": "large_table",
        "Plan Rows": 5000,
        "Actual Rows": 5000
    }
    findings = analyze_plan(raw_plan)
    assert len(findings) == 1
    assert findings[0].node_type == "Seq Scan"
    assert findings[0].severity == "medium"
    assert "Sequential scan" in findings[0].explanation

def test_analyze_row_mismatch():
    raw_plan = {
        "Node Type": "Index Scan",
        "Relation Name": "users",
        "Plan Rows": 1,
        "Actual Rows": 100
    }
    findings = analyze_plan(raw_plan)
    assert len(findings) == 1
    assert findings[0].severity == "high"
    assert "Large discrepancy" in findings[0].explanation

def test_analyze_nested_loop():
    raw_plan = {
        "Node Type": "Nested Loop",
        "Actual Loops": 5000
    }
    findings = analyze_plan(raw_plan)
    assert len(findings) == 1
    assert findings[0].severity == "medium"
    assert "Nested loop executed" in findings[0].explanation

def test_analyze_sort_spill():
    raw_plan = {
        "Node Type": "Sort",
        "Sort Space Type": "Disk",
        "Sort Space Used": 15000
    }
    findings = analyze_plan(raw_plan)
    assert len(findings) == 1
    assert findings[0].severity == "high"
    assert "spilled to disk" in findings[0].explanation

def test_analyze_shared_read():
    raw_plan = {
        "Node Type": "Index Scan",
        "Relation Name": "users",
        "Shared Read Blocks": 1000
    }
    findings = analyze_plan(raw_plan)
    assert len(findings) == 1
    assert findings[0].severity == "medium"
    assert "read 1000 blocks from disk" in findings[0].explanation

def test_analyze_recursive_children():
    raw_plan = {
        "Node Type": "Nested Loop",
        "Plans": [
            {
                "Node Type": "Seq Scan",
                "Relation Name": "small_table",
                "Plan Rows": 10
            },
            {
                "Node Type": "Seq Scan",
                "Relation Name": "huge_table",
                "Plan Rows": 5000,
                "Actual Rows": 5000
            }
        ]
    }
    findings = analyze_plan(raw_plan)
    # The nested loop is fine (loops=0), small_table seq scan is fine (rows=10)
    # The huge_table seq scan should be flagged
    assert len(findings) == 1
    assert findings[0].node_type == "Seq Scan"
    assert findings[0].relation == "huge_table"
