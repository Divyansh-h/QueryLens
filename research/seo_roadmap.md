# SEO Roadmap & Content Calendar (Up to Milestone II)

## 1. Prioritized Week-by-Week SEO Roadmap

This roadmap covers the execution of Technical, On-Page, Content, and Off-Page SEO tasks required to reach our first major traffic milestone (Milestone II).

| Week | Phase | SEO Focus Area | Key Action Items |
| :--- | :--- | :--- | :--- |
| **Week 1** | Foundation | **Technical & Architecture** | • Implement flat URL structure (`/blog/`, `/glossary/`).<br>• Setup Google Search Console and submit XML Sitemap.<br>• Ensure Core Web Vitals (LCP, CLS, INP) for the React app pass "Good" thresholds.<br>• Fix React SPA crawlability (ensure server-side rendering or pre-rendering for SEO pages). |
| **Week 2** | Core Assets | **On-Page & Pillar Content** | • Launch `/visualizer/` with optimized H1, Meta Tags, and 1,000+ words of context.<br>• Publish the primary Pillar Post: "How to read EXPLAIN ANALYZE".<br>• Implement Article & SoftwareApplication JSON-LD Schema. |
| **Week 3** | Expansion | **Cluster Content & Linking** | • Publish 3 cluster articles (Tools, Index vs. Seq Scan, Fix Slow Query).<br>• Execute the Internal Linking Plan (mapping spokes to the Pillar).<br>• Deploy Glossary pages (`/glossary/seq-scan/`, etc.) for long-tail capture. |
| **Week 4** | Authority | **Off-Page & Distribution (Milestone II)** | • Launch on Product Hunt, Hacker News, and r/PostgreSQL.<br>• Distribute tools listicle on dev.to and Medium (using canonical links).<br>• Reach out to GitHub repos and open-source lists for tool inclusion backlinks. |

---

## 2. 6-Post Content Calendar

Based on the content gaps and keyword cannibalization checks, here is the production schedule for the first 6 pieces of content.

| Post # | Target Date | Topic / Title | Primary Keyword | Funnel Stage | Intent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1 (Pillar)** | Week 2 | How to Read a Postgres EXPLAIN ANALYZE Plan | `how to read postgres explain` | Top | Informational |
| **2 (Spoke)** | Week 3 | Postgres Index Scan vs. Sequential Scan Explained | `postgres index scan vs seq scan` | Top/Mid | Informational |
| **3 (Spoke)** | Week 3 | How to Fix a Slow Query in Postgres (Interactive Guide) | `fix slow query postgres` | Bottom | Transactional |
| **4 (Spoke)** | Week 3 | 5 Tools to Find Slow Queries in PostgreSQL (2026) | `tools to find slow queries postgres` | Mid/Bottom | Commercial |
| **5 (Spoke)** | Week 4 | HypoPG Tutorial: Test Postgres Indexes In-Browser | `hypopg tutorial` | Mid | Navigational |
| **6 (Spoke)** | Week 4 | How to Avoid Sequential Scans in PostgreSQL | `how to avoid seq scan postgres` | Bottom | Transactional |

---

## 3. Hub-and-Spoke Internal Linking Plan

To maximize the flow of PageRank and establish topical authority, we will use a **Hub-and-Spoke model** centered around our Pillar post.

**The Hub (Pillar Post):** `/blog/how-to-read-postgres-explain/`

### The Linking Architecture:

1. **Spokes to Hub (Upward Links)**
   * Every spoke article **must** link back to the Pillar post exactly once, high up in the body content.
   * *Example:* In "How to Avoid Sequential Scans", write: *"Before you can eliminate a sequential scan, you must first know [how to read your Postgres EXPLAIN plan](#) to confirm it is actually causing the bottleneck."*

2. **Hub to Spokes (Downward Links)**
   * The Pillar post acts as a table of contents for deep dives. It will link out to the spoke articles when a concept becomes too technical for the beginner guide.
   * *Example:* In the Pillar post, write: *"If you notice your plan is heavily relying on Sequential Scans rather than Indexes, read our guide on [Index Scan vs. Sequential Scan](#) for a deep dive."*

3. **All Content to Tool (Conversion Links)**
   * **Every** blog post and glossary page must feature a sticky sidebar or in-line CTA linking directly to `/visualizer/` using commercial anchor text.
   * *Example Anchor Text:* "Postgres EXPLAIN visualizer", "Analyze your query now", "Interactive Postgres tool".

4. **Hub to Glossary (Definition Links)**
   * The Pillar post will naturally mention terms like `Hash Join`, `Nested Loop`, and `Cost`. These will link directly to their respective `/glossary/` definitions.
