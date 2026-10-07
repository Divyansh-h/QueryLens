# QueryLens SEO Website Architecture & URL Taxonomy

This document outlines the site architecture and URL taxonomy designed to maximize SEO performance, capture our target keywords, and drive traffic to the QueryLens tool.

## URL Taxonomy Principles
* **Flat Structure:** Keep URLs as close to the root domain as possible (e.g., `/blog/fix-slow-query` rather than `/blog/performance-tuning/fix-slow-query`).
* **Keyword Optimized:** Slugs are exact-match or close variations of our primary target keywords.
* **Hyphenated:** Use hyphens (`-`) to separate words, not underscores.

---

## Site Architecture Tree

```text
querylens.dev/ (or .com)
│
├── / (Home)
│   └── Intent: Brand landing page, value proposition, and main CTA.
│
├── /about/ (About Us)
│   └── Intent: Team, mission, and establishing E-E-A-T (Experience, Expertise, Authoritativeness, Trustworthiness).
│
├── /visualizer/ (QueryLens Tool Page)
│   └── Intent: The main app page (or a landing page that links/redirects to the Render app).
│   └── Target Keyword: `postgres explain visualizer`
│
├── /glossary/ (PostgreSQL Terms & Definitions)
│   ├── /glossary/seq-scan
│   ├── /glossary/index-scan
│   ├── /glossary/hash-join
│   ├── /glossary/nested-loop-join
│   ├── /glossary/bitmap-heap-scan
│   ├── /glossary/bitmap-index-scan
│   └── Intent: Definition pages capturing top-of-funnel informational searches.
│
└── /blog/ (Content Hub)
    │
    ├── Category: EXPLAIN Guides (Slug: /blog/category/explain/)
    │   ├── /blog/how-to-read-postgres-explain
    │   ├── /blog/postgres-explain-costs
    │   └── /blog/understand-query-planner-postgres
    │
    ├── Category: Indexing (Slug: /blog/category/indexing/)
    │   ├── /blog/postgres-index-types
    │   ├── /blog/b-tree-index-postgres
    │   ├── /blog/postgres-composite-index
    │   ├── /blog/postgres-partial-index
    │   ├── /blog/hypopg-tutorial
    │   └── /blog/postgres-index-scan-vs-seq-scan
    │
    ├── Category: Performance Tuning (Slug: /blog/category/performance/)
    │   ├── /blog/fix-slow-query-postgres
    │   ├── /blog/how-to-avoid-seq-scan-postgres
    │   ├── /blog/optimize-joins-postgres
    │   ├── /blog/optimize-order-by-postgres
    │   └── /blog/limit-offset-performance-postgres
    │
    └── Category: Tools (Slug: /blog/category/tools/)
        ├── /blog/tools-to-find-slow-queries-postgres
        ├── /blog/pg-stat-statements-tutorial
        └── /blog/postgres-slow-query-log
```

---

## URL Slug Mapping for Target Keywords

Here is how our top opportunities map to specific URLs:

| Page Type | Target Keyword | URL Slug |
| :--- | :--- | :--- |
| **Tool Landing** | postgres explain visualizer | `/visualizer/` |
| **Blog (Guide)** | how to read postgres explain | `/blog/how-to-read-postgres-explain/` |
| **Blog (Guide)** | fix slow query postgres | `/blog/fix-slow-query-postgres/` |
| **Blog (Listicle)** | tools to find slow queries postgres | `/blog/tools-to-find-slow-queries-postgres/` |
| **Blog (Tutorial)** | hypopg tutorial | `/blog/hypopg-tutorial/` |
| **Blog (Guide)** | postgres index scan vs seq scan | `/blog/postgres-index-scan-vs-seq-scan/` |
| **Glossary** | hash join postgres | `/glossary/hash-join/` |
| **Glossary** | sequential scan postgres | `/glossary/seq-scan/` |
