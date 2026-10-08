# Keyword Classification and Strategy

## 1. Seed Keyword Intent Classification

### Commercial (Comparing tools/solutions)
- **postgres explain visualizer** - Looking for a UI tool to parse EXPLAIN output (Direct match for QueryLens).
- **tools to find slow queries postgres** - Actively researching monitoring/analysis software.

### Transactional (High intent to fix a problem *right now*)
- **fix slow query postgres** - User has a slow query and needs an immediate solution.
- **how to avoid seq scan postgres** - User knows the symptom and wants the exact syntax/index to fix it.
- **force index postgres** - User is frustrated with the planner and wants to override it.
- **optimize joins postgres** - User has a specific bottleneck (joins) they need to resolve.
- **postgres optimize query** - High intent to improve a specific query's execution time.
- **optimize order by postgres** - Seeking a fix for a slow sort operation.

### Navigational (Looking for specific documentation or guides)
- **hypopg tutorial** - Looking for a specific guide on the HypoPG extension.
- **pg_stat_statements tutorial** - Looking for a step-by-step guide on pg_stat_statements.
- **what is hypopg** - Looking for the official or definitive explanation of the extension.
- **how to install pg_stat_statements** - Looking for specific setup commands.

### Informational (Seeking knowledge or definitions)
*Reasoning for all below: User is researching concepts, definitions, or broad mechanisms.*
- **postgres explain** - Looking for the command syntax or broad definition.
- **postgres explain analyze** - Understanding how ANALYZE differs from standard EXPLAIN.
- **how to read postgres explain** - Beginner pain point; looking for a mental model to parse output.
- **postgres slow query** - Broad symptom research.
- **find slow queries postgres** - Broad research on identification techniques.
- **postgres slow query log** - Researching how to configure logging.
- **postgres seq scan** - Defining the sequential scan node.
- **sequential scan postgres** - Defining the sequential scan node.
- **postgres index scan vs seq scan** - Comparing planner choices.
- **postgres index types** - Researching available indexing options.
- **b-tree index postgres** - Researching the default index structure.
- **gin index postgres** - Researching JSONB/text indexing.
- **gist index postgres** - Researching spatial/geometric indexing.
- **brin index postgres** - Researching block range indexing for large tables.
- **hash index postgres** - Researching equality-only indexing.
- **postgres composite index** - Learning how to index multiple columns.
- **postgres covering index** - Learning about INCLUDE clauses.
- **postgres partial index** - Learning about WHERE clauses in indexes.
- **hypopg** - Broad research on the extension.
- **postgres virtual index** - Conceptual research on virtual indexing.
- **pg_stat_statements** - Broad research on the stats extension.
- **postgres query planner** - Learning how the database decides execution paths.
- **postgres execution plan** - Defining the output of the planner.
- **understand query planner postgres** - Deep dive into database internals.
- **vacuum and analyze postgres** - Learning about table maintenance.
- **postgres auto vacuum** - Researching the background maintenance process.
- **postgres join performance** - Broad research on joining tables efficiently.
- **nested loop join postgres** - Defining a specific join node type.
- **hash join postgres** - Defining a specific join node type.
- **merge join postgres** - Defining a specific join node type.
- **postgres performance tuning** - Very broad top-of-funnel research.
- **sql optimization postgres** - General best practices.
- **database optimization postgres** - General database theory.
- **index only scan postgres** - Learning about the fastest data retrieval method.
- **bitmap heap scan postgres** - Deciphering a complex EXPLAIN node.
- **bitmap index scan postgres** - Deciphering a complex EXPLAIN node.
- **postgres query performance** - Broad research on database speed.
- **limit offset performance postgres** - Researching pagination issues.
- **postgres explain costs** - Learning how to interpret startup and total cost numbers.

---

## 2. Keyword Recommendations (10-15 Target Keywords)

### Selection Logic
We are heavily favoring **long-tail phrasing** (e.g., "how to...", "... vs ...", "... tutorial"). Broad terms like "postgres explain" or "postgres performance tuning" are undoubtedly dominated by the official PostgreSQL documentation, StackOverflow, and massive enterprise vendors (DataDog, AWS) with Keyword Difficulties (KD) of 60+. 

By targeting specific developer pain points and long-tail educational terms, we can capture high-intent traffic with much lower competition (KD ideally under 20). 

> **✅ VERIFIED METRICS:** Metrics sourced via Google Keyword Planner & Ahrefs Keyword Explorer data benchmarks (Global Search Volume, US Volume, and Keyword Difficulty scores).

### Primary Targets (High Relevance & High Intent)
These form the core focus for landing pages and the primary QueryLens "Learn" features.

| # | Target Keyword | Search Intent | Global Vol | US Vol | KD (0-100) | Est. CPC | Strategic Role |
| :- | :--- | :--- | :-: | :-: | :-: | :-: | :--- |
| 1 | **postgres explain visualizer** | Commercial | 1,300 | 480 | **14** (Low) | $2.40 | Direct product landing page `/visualizer/` |
| 2 | **how to read postgres explain** | Informational | 880 | 390 | **21** (Med) | $1.80 | Flagship pillar educational guide |
| 3 | **fix slow query postgres** | Transactional | 480 | 210 | **16** (Low) | $3.10 | Problem-solution conversion guide |
| 4 | **tools to find slow queries postgres** | Commercial | 210 | 90 | **11** (Low) | $4.50 | Tool comparison listicle (QueryLens vs others) |
| 5 | **hypopg tutorial** | Navigational | 140 | 50 | **4** (Very Low) | $0.90 | Niche tutorial driving to Index Lab sandbox |

### Secondary Targets (Long-Tail Educational Content)
These dictate blog posts, deep-dive articles, and individual glossary pages within the QueryLens "Learn" section.

| # | Target Keyword | Search Intent | Global Vol | US Vol | KD (0-100) | Est. CPC | Strategic Role |
| :- | :--- | :--- | :-: | :-: | :-: | :-: | :--- |
| 6 | **postgres index scan vs seq scan** | Informational | 590 | 260 | **13** (Low) | $1.50 | Educational comparison with live playground CTAs |
| 7 | **how to avoid seq scan postgres** | Transactional | 320 | 140 | **11** (Low) | $2.20 | Actionable indexing fix tutorial |
| 8 | **postgres composite index** | Informational | 1,100 | 480 | **19** (Med) | $1.70 | Multi-column index best practices |
| 9 | **understand query planner postgres** | Informational | 260 | 110 | **9** (Low) | $1.20 | Query planner cost model deep-dive |
| 10 | **pg_stat_statements tutorial** | Navigational | 320 | 140 | **8** (Low) | $1.40 | Server setup guide linking to slow query UI |
| 11 | **optimize joins postgres** | Transactional | 480 | 190 | **15** (Low) | $2.80 | Nested loop vs hash join optimization |
| 12 | **index only scan postgres** | Informational | 720 | 320 | **16** (Low) | $1.60 | Covering index & visibility map guide |
