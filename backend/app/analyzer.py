from typing import List, Dict, Any
from app.schemas import Finding

SEQ_SCAN_THRESHOLD = 1000
NESTED_LOOP_THRESHOLD = 1000
HIGH_SHARED_READ_THRESHOLD = 500  # blocks

def analyze_plan(raw_plan: Dict[str, Any]) -> List[Finding]:
    findings = []
    
    def traverse(node: Dict[str, Any]):
        node_type = node.get("Node Type", "Unknown")
        relation = node.get("Relation Name") or node.get("Index Name")
        
        # 1. Sequential Scan on large tables
        if node_type == "Seq Scan":
            actual_rows = node.get("Actual Rows")
            est_rows = node.get("Plan Rows", 0)
            rows = actual_rows if actual_rows is not None else est_rows
            
            if rows > SEQ_SCAN_THRESHOLD:
                findings.append(Finding(
                    severity="medium",
                    node_type=node_type,
                    relation=relation,
                    explanation=f"Sequential scan on a table returning {rows} rows. This requires reading all blocks and can be slow.",
                    suggestion="Consider adding an index on the filtered columns to allow an Index Scan."
                ))
                
        # 2. Estimated vs Actual mismatch (>10x)
        est_rows = node.get("Plan Rows", 1)
        actual_rows = node.get("Actual Rows")
        if actual_rows is not None:
            est_rows_safe = max(est_rows, 1)
            actual_rows_safe = max(actual_rows, 1)
            ratio = max(actual_rows_safe / est_rows_safe, est_rows_safe / actual_rows_safe)
            
            if ratio > 10:
                findings.append(Finding(
                    severity="high",
                    node_type=node_type,
                    relation=relation,
                    explanation=f"Large discrepancy between estimated rows ({est_rows}) and actual rows ({actual_rows}).",
                    suggestion="Run ANALYZE on this table to update statistics, which helps the query planner choose better plans."
                ))
                
        # 3. Nested loops with high loops
        if node_type == "Nested Loop":
            loops = node.get("Actual Loops", 0)
            if loops > NESTED_LOOP_THRESHOLD:
                findings.append(Finding(
                    severity="medium",
                    node_type=node_type,
                    relation=relation,
                    explanation=f"Nested loop executed {loops} times. This multiplies the cost of the inner node by {loops}.",
                    suggestion="Check if a Hash Join or Merge Join is possible, or if missing indexes force a loop over an unindexed relation."
                ))
                
        # 4. Sort spilling to disk
        if node_type == "Sort":
            sort_space = node.get("Sort Space Type")
            if sort_space == "Disk":
                space_used = node.get("Sort Space Used", "unknown amount of")
                findings.append(Finding(
                    severity="high",
                    node_type=node_type,
                    relation=relation,
                    explanation=f"Sort operation spilled to disk using {space_used} KB. Disk sorts are significantly slower than in-memory sorts.",
                    suggestion="Increase 'work_mem' to allow this sort to complete in memory, or add an index to provide pre-sorted data."
                ))
                
        # 5. High shared-read buffers
        shared_read = node.get("Shared Read Blocks", 0)
        if shared_read > HIGH_SHARED_READ_THRESHOLD:
            findings.append(Finding(
                severity="medium",
                node_type=node_type,
                relation=relation,
                explanation=f"Node had to read {shared_read} blocks from disk instead of memory cache.",
                suggestion="This is often normal for cold data, but if frequent, consider increasing 'shared_buffers' or optimizing the query to read fewer rows."
            ))
            
        # Recurse children
        for child in node.get("Plans", []):
            traverse(child)
            
    traverse(raw_plan)
    return findings
