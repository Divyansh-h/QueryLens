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

> **⚠️ CRITICAL:** Every single keyword below **[MUST BE VERIFIED]** using Ubersuggest, Ahrefs, or Google Keyword Planner. We are hypothesizing low KD based on long-tail structure, but live data dictates the final roadmap.

### Primary Targets (High Relevance & High Intent)
These should be the core focus for landing pages and the primary QueryLens "Learn" features.

1. **postgres explain visualizer** *(Commercial)* - **[MUST VERIFY KD/Vol]** The exact definition of the QueryLens product. 
2. **how to read postgres explain** *(Informational)* - **[MUST VERIFY KD/Vol]** Perfect top-of-funnel keyword for the Learn page. Solves the exact pain point QueryLens addresses.
3. **fix slow query postgres** *(Transactional)* - **[MUST VERIFY KD/Vol]** Extremely high intent. Captures developers actively looking for a sandbox to fix their issue.
4. **tools to find slow queries postgres** *(Commercial)* - **[MUST VERIFY KD/Vol]** Captures users evaluating monitoring stacks where pg_stat_statements + QueryLens fits perfectly.
5. **hypopg tutorial** *(Navigational)* - **[MUST VERIFY KD/Vol]** Highly niche. Captures developers explicitly wanting to test virtual indexing, which QueryLens provides out-of-the-box.

### Secondary Targets (Long-Tail Educational Content)
These should dictate blog posts, deep-dive articles, and individual glossary pages within the QueryLens "Learn" section.

6. **postgres index scan vs seq scan** *(Informational)* - **[MUST VERIFY KD/Vol]** Classic educational comparison that naturally leads to a "try it yourself" call-to-action in QueryLens.
7. **how to avoid seq scan postgres** *(Transactional)* - **[MUST VERIFY KD/Vol]** Action-oriented. We can write an article showing how creating an index in QueryLens eliminates the seq scan.
8. **postgres composite index** *(Informational)* - **[MUST VERIFY KD/Vol]** Niche enough to have low KD, but critical for users optimizing multi-column queries.
9. **understand query planner postgres** *(Informational)* - **[MUST VERIFY KD/Vol]** Attracts developers trying to level up their backend skills.
10. **pg_stat_statements tutorial** *(Navigational)* - **[MUST VERIFY KD/Vol]** A guide on setting this up locally transitions perfectly into using QueryLens to visualize the results.
11. **optimize joins postgres** *(Transactional)* - **[MUST VERIFY KD/Vol]** Very common bottleneck for ORM-heavy applications (Django/Prisma).
12. **index only scan postgres** *(Informational)* - **[MUST VERIFY KD/Vol]** Niche educational term to teach developers about covering indexes.
