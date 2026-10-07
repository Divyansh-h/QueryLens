# Long-Tail Keywords, LSI, and PAA Strategy

## 1. Long-Tail & LSI (Latent Semantic Indexing) Target Keywords
These long-tail phrases reflect specific developer intents and represent high-value, likely low-competition targets.

| Keyword / Phrase | Relevance (1-10) | Reasoning | Competition |
| :--- | :---: | :--- | :--- |
| `visualize postgres explain analyze output` | **10/10** | The exact, literal use-case of the QueryLens tool. High conversion likelihood. | |
| `why does postgres choose seq scan over index scan` | **9/10** | Massive developer pain point; excellent for an educational article tying into the Sandbox. | |
| `create virtual index postgres hypopg` | **9/10** | Very specific, high-intent. Users searching this are ready for the Index Lab feature. | |
| `pg_stat_statements query execution time` | **8/10** | Perfect transition keyword for introducing the Slow Queries dashboard. | |
| `fix slow join queries in postgresql` | **8/10** | A common ORM/developer bottleneck. Highly actionable. | |
| `how to find missing indexes in postgres` | **9/10** | A core problem that QueryLens solves via HypoPG suggestions. | |
| `postgres explain cost vs actual time` | **7/10** | Good educational concept; drives users to understand the planner vs. execution. | |
| `best tool for postgres query tuning` | **10/10** | Pure commercial intent. Developers actively looking for a product like QueryLens. | |

---

## 2. "People Also Ask" (PAA) Questions for Content & Blog Topics
Targeting these specific questions as H2s or dedicated blog posts allows us to capture Google PAA snippets and drive highly relevant organic traffic.

### Performance & Bottlenecks
1. Why is my PostgreSQL query suddenly slow? *(Informational)*
2. How do I find the slowest queries in my Postgres database? *(Informational)*
3. Why does my query run fast locally but slow in production? *(Informational)*
4. What are the most common reasons for slow PostgreSQL performance? *(Informational)*
5. How do I fix "Out of Memory" errors during Postgres queries? *(Transactional)*
6. How does work_mem affect query sorting and joining in Postgres? *(Informational)*

### Understanding EXPLAIN
7. How do I read EXPLAIN ANALYZE in Postgres? *(Informational)*
8. What is the difference between EXPLAIN and EXPLAIN ANALYZE? *(Informational)*
9. What does "cost=" mean in a Postgres query plan? *(Informational)*
10. How do I reduce planning time in PostgreSQL? *(Transactional)*
11. What is the best visualizer for Postgres query plans? *(Commercial)*
12. Why is Postgres doing a Seq Scan on a small table? *(Informational)*

### Indexing & Planner Behavior
13. Why is Postgres ignoring my index? *(Transactional)*
14. How do I force PostgreSQL to use an index? *(Transactional)*
15. What is a sequential scan in PostgreSQL? *(Informational)*
16. Is a sequential scan always bad in Postgres? *(Informational)*
17. What does "Index Only Scan" mean in EXPLAIN output? *(Informational)*
18. What is a Bitmap Heap Scan in Postgres? *(Informational)*
19. How do I test an index without actually building it in Postgres? *(Commercial / Transactional)*
20. How do I create a composite index in Postgres? *(Informational)*
21. When should I use a partial index in PostgreSQL? *(Informational)*
22. What is a BRIN index and when should developers use it? *(Informational)*

### Joins & Query Construction
23. How do I optimize a slow JOIN in PostgreSQL? *(Transactional)*
24. What is a Hash Join vs Nested Loop in Postgres? *(Informational)*
25. How do you use CTEs (WITH clauses) without slowing down Postgres? *(Informational)*
26. How do I optimize ORDER BY and LIMIT in Postgres? *(Transactional)*

### Extensions & Maintenance
27. How do you install and use pg_stat_statements? *(Navigational)*
28. How do I interpret pg_stat_statements output? *(Informational)*
29. What is HypoPG and how does virtual indexing work? *(Informational)*
30. How does Postgres VACUUM affect query performance? *(Informational)*
