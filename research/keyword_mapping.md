# Keyword-to-Page Mapping & Cannibalization Check

## Cannibalization Check & Fixes
Before finalizing the mapping, we audited the seed keyword list for overlapping intents that could cause keyword cannibalization (multiple pages on our site competing for the same Google search results):

1. **Overlap Detected**: `postgres slow query`, `find slow queries postgres`, and `tools to find slow queries postgres`. 
   - *Fix*: Consolidated into a single page (`/blog/tools-to-find-slow-queries-postgres/`). The intent for all three is identical: the user is looking for monitoring or identification mechanisms.
2. **Overlap Detected**: `postgres explain`, `postgres execution plan`, and `how to read postgres explain`.
   - *Fix*: Consolidated into `/blog/how-to-read-postgres-explain/`. A standalone definition page for "postgres explain" would inevitably cannibalize the "how to read" tutorial.
3. **Overlap Detected**: `hypopg` and `what is hypopg` vs. `hypopg tutorial`.
   - *Fix*: Mapped to `/blog/hypopg-tutorial/`. The tutorial will contain an H2 answering "What is HypoPG?" to capture the definitional search volume without splitting equity.

---

## Keyword Mapping Table

| URL Slug | Primary Keyword | Secondary & LSI Terms | Intent | Title Tag (max 60 chars) | Meta Description (max 155 chars) | H1 (On-Page Title) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `/visualizer/` | postgres explain visualizer | pgexplain, postgres explain analyze, query visualization tool | Commercial | Postgres EXPLAIN Visualizer: Analyze Queries Instantly | Paste your Postgres EXPLAIN ANALYZE output into our interactive visualizer. Instantly identify bottlenecks, slow nodes, and missing indexes for free. | Interactive Postgres EXPLAIN Visualizer |
| `/blog/how-to-read-postgres-explain/` | how to read postgres explain | postgres execution plan, understand query planner, explain costs | Informational | How to Read a Postgres EXPLAIN ANALYZE Plan | A complete guide to understanding PostgreSQL execution plans. Learn how to read EXPLAIN ANALYZE output, interpret cost metrics, and spot slow queries. | How to Read and Understand Postgres EXPLAIN Plans |
| `/blog/fix-slow-query-postgres/` | fix slow query postgres | postgres optimize query, sql optimization postgres, database tuning | Transactional | How to Fix a Slow Query in Postgres (Interactive Guide) | Stop guessing. Learn how to find and fix slow queries in PostgreSQL using execution plans, missing indexes, and query refactoring. | How to Diagnose and Fix Slow Queries in PostgreSQL |
| `/blog/tools-to-find-slow-queries-postgres/` | tools to find slow queries postgres | find slow queries postgres, postgres slow query log, pg_stat_statements | Commercial | 5 Tools to Find Slow Queries in PostgreSQL (2026) | Compare the best tools for tracking down slow Postgres queries, from built-in extensions like pg_stat_statements to visualizers like QueryLens. | The Best Tools to Find Slow Queries in Postgres |
| `/blog/hypopg-tutorial/` | hypopg tutorial | what is hypopg, postgres virtual index, test indexes | Navigational | HypoPG Tutorial: Test Postgres Indexes Without Building Them | Learn how to use the HypoPG extension to create virtual indexes in PostgreSQL. Safely test query performance without locking tables in production. | HypoPG Tutorial: A Guide to Virtual Indexing in Postgres |
| `/blog/postgres-index-scan-vs-seq-scan/` | postgres index scan vs seq scan | sequential scan postgres, query planner, index only scan | Informational | Postgres Index Scan vs. Sequential Scan Explained | Understand the difference between an Index Scan and a Seq Scan in PostgreSQL. Learn why the query planner chooses each and how to optimize them. | Postgres Index Scan vs. Sequential Scan: What's the Difference? |
| `/blog/how-to-avoid-seq-scan-postgres/` | how to avoid seq scan postgres | force index postgres, postgres performance tuning | Transactional | How to Avoid Sequential Scans in PostgreSQL | Sequential scans killing your database? Learn exactly how to identify them in your EXPLAIN plans and avoid them using proper B-tree and covering indexes. | How to Avoid Sequential Scans in Postgres |
| `/glossary/hash-join/` | hash join postgres | nested loop join, merge join, join performance | Informational | What is a Hash Join in Postgres? (Query Planner Guide) | Learn how the PostgreSQL query planner uses Hash Joins to combine tables, how it differs from Nested Loops, and when it causes performance issues. | What is a Hash Join in PostgreSQL? |
