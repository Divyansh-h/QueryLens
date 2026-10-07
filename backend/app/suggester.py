import re
from typing import List, Dict, Any, Set
from app.schemas import IndexSuggestion

def extract_cols(expr: str) -> List[str]:
    # Remove strings
    expr = re.sub(r"'.*?'", "", expr)
    # Find words
    words = re.findall(r'\b[a-z_][a-z0-9_]*\b', expr.lower())
    keywords = {
        'and', 'or', 'not', 'is', 'null', 'true', 'false', 'text', 'integer', 'numeric', 
        'date', 'timestamp', 'now', 'any', 'all', 'sum', 'count', 'avg', 'min', 'max'
    }
    cols = []
    for w in words:
        if w not in keywords and not w.startswith('pg_'):
            if w not in cols:
                cols.append(w)
    return cols

def suggest_indexes(raw_plan: Dict[str, Any]) -> List[IndexSuggestion]:
    suggestions: List[IndexSuggestion] = []
    seen: Set[str] = set()

    def add_suggestion(stmt: str, reasoning: str, rank: int):
        if stmt not in seen:
            seen.add(stmt)
            suggestions.append(IndexSuggestion(statement=stmt, reasoning=reasoning, rank=rank))

    def traverse(node: Dict[str, Any]):
        relation = node.get("Relation Name")
        
        # Look for Filters and Sorts on a specific relation
        if relation:
            filters = node.get("Filter", "")
            sort_keys = node.get("Sort Key", [])
            
            filter_cols = extract_cols(filters) if filters else []
            sort_cols = []
            for sk in sort_keys:
                sort_cols.extend(extract_cols(sk))
                
            # Remove duplicates while preserving order
            filter_cols = list(dict.fromkeys(filter_cols))
            sort_cols = list(dict.fromkeys(sort_cols))
            
            # Composite index: filter columns first (equality/range), then sort columns
            if filter_cols and sort_cols:
                combined = []
                for c in filter_cols:
                    if c not in combined: combined.append(c)
                for c in sort_cols:
                    if c not in combined: combined.append(c)
                    
                cols_joined = ", ".join(combined)
                stmt = f"CREATE INDEX idx_{relation}_composite ON {relation} ({cols_joined});"
                reasoning = f"Composite index for {relation}: covers filtering on ({', '.join(filter_cols)}) and sorting on ({', '.join(sort_cols)})."
                add_suggestion(stmt, reasoning, rank=1)
                
            # Single indexes for filters
            if filter_cols:
                for col in filter_cols:
                    stmt = f"CREATE INDEX idx_{relation}_{col} ON {relation} ({col});"
                    reasoning = f"Improves filter performance on {relation}.{col}."
                    add_suggestion(stmt, reasoning, rank=2)
                    
            # Single indexes for sorts
            if sort_cols and not filter_cols:
                for col in sort_cols:
                    stmt = f"CREATE INDEX idx_{relation}_{col}_sort ON {relation} ({col});"
                    reasoning = f"Speeds up sorting on {relation}.{col} without requiring an in-memory or disk sort."
                    add_suggestion(stmt, reasoning, rank=3)

        # Look for Join Conditions (Hash Cond, Merge Cond)
        for cond_key in ["Hash Cond", "Merge Cond", "Join Filter"]:
            cond = node.get(cond_key)
            if cond:
                # Find table.column patterns
                matches = re.findall(r'([a-z_][a-z0-9_]*)\.([a-z_][a-z0-9_]*)', cond.lower())
                for tbl, col in matches:
                    stmt = f"CREATE INDEX idx_{tbl}_{col}_join ON {tbl} ({col});"
                    reasoning = f"Improves join performance by indexing the join key {col} on table {tbl}."
                    add_suggestion(stmt, reasoning, rank=1)

        for child in node.get("Plans", []):
            traverse(child)

    traverse(raw_plan)
    suggestions.sort(key=lambda x: x.rank)
    return suggestions
