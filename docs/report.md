<div align="center">
  <h1>CSET489 SEO Assignment</h1>
  <h2>QueryLens: PostgreSQL Query Optimization for Developers</h2>
  <br>
  <p><strong>Name:</strong> [YourName]</p>
  <p><strong>Roll No:</strong> [RollNo]</p>
  <br><br><br>
</div>

<div style="page-break-after: always;"></div>

## Table of Contents
1. [Niche and Problem](#1-niche-and-problem)
2. [Keyword Research](#2-keyword-research)
3. [SERP Analysis](#3-serp-analysis)
4. [Competitor Analysis](#4-competitor-analysis)
5. [Keyword Mapping](#5-keyword-mapping)
6. [SEO Strategy](#6-seo-strategy)
7. [Domain/DNS/Cloudflare](#7-domaindnscloudflare)
8. [VPS and WordPress](#8-vps-and-wordpress)
9. [QueryLens (GitHub and Render)](#9-querylens-github-and-render)
10. [Evidence](#10-evidence)
11. [Unfilled Placeholders (To-Do List)](#11-unfilled-placeholders-to-do-list)
12. [Evidence Index](#12-evidence-index)

<div style="page-break-after: always;"></div>

# QueryLens SEO & Infrastructure Final Report (Milestone I)


## 1. Niche and Problem
**Niche:** PostgreSQL Query Optimization for Developers.
QueryLens helps developers understand, analyze, and optimize PostgreSQL queries without needing deep DBA expertise. It acts as an educational and operational sandbox for resolving database bottlenecks.

**Target Personas:**
- **The Junior Backend Developer:** Wants to learn efficient SQL; struggles reading EXPLAIN output.
- **The Full-Stack Developer:** Needs to fix slow endpoints quickly without reading deep Postgres manuals.
- **The Accidental DBA:** Needs a tool to share plans with devs to prove why queries are slow.

**The Problem:** Developers write inefficient SQL because they cannot interpret PostgreSQL execution plans or safely experiment with indexing, leading to slow apps and high costs.

**The Solution:** QueryLens—an interactive, visual sandbox that translates complex `EXPLAIN` plans into actionable insights and provides an ephemeral environment for testing virtual indexes via HypoPG.

---

## 2. Keyword Research
We identified a comprehensive seed list categorized by intent:
- **Commercial:** `postgres explain visualizer`, `tools to find slow queries postgres`
- **Transactional:** `fix slow query postgres`, `optimize joins postgres`
- **Navigational:** `hypopg tutorial`, `pg_stat_statements tutorial`
- **Informational:** `how to read postgres explain`, `postgres index scan vs seq scan`

We favored long-tail phrasing over broad terms to target high-intent developers with lower competition.

---

## 3. SERP Analysis
We scraped the top 3 results for our 5 primary keywords. Key findings:
- **Code Blocks are Mandatory:** Educational queries require 20 to 100+ code blocks to rank as technical authorities.
- **Length equals Intent:** Troubleshooting and informational queries rank best with long-form content (1,500-2,500+ words).
- **Tools lack Content:** Pure tools (like Dalibo) rank with <200 words on functionality alone but offer zero educational value.
- **Structured Data:** Top tech blogs heavily utilize JSON-LD Article/FAQ schema.

---

## 4. Competitor Analysis
**Primary Competitors Analyzed:**
- **Dalibo PEV2 (`explain.dalibo.com`)**: Open-source visualizer benchmark. Lacks any educational context.
- **pganalyze (`pganalyze.com`)**: Enterprise optimization benchmark. Heavy on static, dense blog posts but lacks interactive, in-browser sandboxes for non-customers.

**The Opportunity Gap:** The "Interactive Education" hybrid. Combining the functionality of Dalibo with the educational depth of pganalyze.

---

## 5. Keyword Mapping
We resolved several cannibalization risks (e.g., merging `tools to find slow queries postgres` and `find slow queries postgres`) into a strict one-primary-keyword-per-URL map:

| URL Slug | Primary Keyword | Intent | Title Tag |
| :--- | :--- | :--- | :--- |
| `/visualizer/` | postgres explain visualizer | Commercial | Postgres EXPLAIN Visualizer: Analyze Queries Instantly |
| `/blog/how-to-read-postgres-explain/` | how to read postgres explain | Informational | How to Read a Postgres EXPLAIN ANALYZE Plan |
| `/blog/fix-slow-query-postgres/` | fix slow query postgres | Transactional | How to Fix a Slow Query in Postgres (Interactive) |
| `/blog/tools-to-find-slow-queries-postgres/` | tools to find slow queries postgres | Commercial | 5 Tools to Find Slow Queries in PostgreSQL (2026) |
| `/blog/hypopg-tutorial/` | hypopg tutorial | Navigational | HypoPG Tutorial: Test Postgres Indexes In-Browser |

---

## 6. SEO Strategy
**Site Architecture:** Flat structure (`/blog/`, `/glossary/`, `/visualizer/`) keeping URLs close to the root domain.
**Content Calendar:** A 6-post sprint focusing on our mapped gaps.
**Internal Linking:** A Hub-and-Spoke model centered around the Pillar post: "How to read EXPLAIN ANALYZE". All spoke articles link up to the hub, and all pages aggressively link to the `/visualizer/` conversion page.

---

## 7. Domain/DNS/Cloudflare
Scripts and guides were created to automate and document:
- Moving registrar nameservers to Cloudflare.
- Setting A records (root) and CNAMEs (`www`).
- Setting a DNS-Only CNAME for `app.[DOMAIN]` to route to Render.
- Configuring Cloudflare SSL (Full Strict) and Auto Minification rules.

---

## 8. VPS and WordPress
We built automated bash scripts for securing and provisioning the SEO marketing site:
- **`vps_provisioning_guide.md`**: Manual lockdown of Ubuntu 24.04 (SSH keys, UFW, non-root user).
- **`server_setup.sh`**: Installs Nginx, MariaDB, PHP 8.3-FPM.
- **`wp_domain_setup.sh`**: Configures the DB, Nginx caching blocks, and Certbot SSL.
- **`wp_cli_setup.sh`**: Installs WordPress, sets SEO permalinks (`/%postname%/`), installs a lightweight theme (Astra), clears bloat, and programmatically builds the exact Site Architecture tree.

---

## 9. QueryLens (GitHub and Render)

**Purpose:** 
QueryLens is a free, interactive web application that parses dense PostgreSQL `EXPLAIN ANALYZE` outputs into visual node trees and provides AI-driven index suggestions (via HypoPG). It serves as the primary "Hook" for our target audience.

**How it Supports the SEO Strategy:**
- **Link-Worthy Tool (Backlink Magnet):** Free, highly functional developer tools attract natural backlinks from forums (Reddit, StackOverflow), GitHub READMEs, and aggregator sites (HackerNews), dramatically boosting domain authority faster than content alone.
- **GA4 Event Tracking (Upcoming):** The tool is instrumented for complex user journeys. We can track events like "Pasted Query," "Applied Virtual Index," and "Fixed Slow Query" to build highly targeted retargeting audiences and measure exact tool-to-content conversion rates.
- **Programmatic Explainer Pages (Upcoming):** Future iterations will dynamically generate dedicated URLs for specific node types (e.g., `app.[DOMAIN]/nodes/bitmap-heap-scan`) directly from user queries, creating thousands of indexable, long-tail glossary pages automatically.

**Architecture:**
```mermaid
graph TD
    User([User / Developer]) -->|HTTPS (app.domain.com)| CF[Cloudflare DNS Only]
    CF -->|Routing| R_FE[Render Web Service: Vite/React Frontend]
    R_FE -->|API Calls| R_BE[Render Web Service: FastAPI Backend]
    
    subgraph Render Environment
        R_BE -->|psycopg async pool| DB[(PostgreSQL 16 Container)]
        DB -->|HypoPG Extension| DB
        DB -->|pg_stat_statements| DB
    end
    
    subgraph SEO Infrastructure (VPS)
        User -->|HTTPS (domain.com)| CF_Proxy[Cloudflare Proxied]
        CF_Proxy --> Nginx[VPS Nginx]
        Nginx --> WP[WordPress Core]
        WP -.->|Links to Tool| R_FE
    end
```

**Links & Deployments:**
- **GitHub Repository:** [Divyansh-h/QueryLens](https://github.com/Divyansh-h/QueryLens)
- **Live Render Application:** [https://querylens-xodd.onrender.com](https://querylens-xodd.onrender.com) (Will map to `app.[DOMAIN]`)

**Screenshots Required for Marketing (Placeholders):**
*Figure 1: The blank query input screen highlighting the "Analyze" button*
*Figure 2: A complex parsed node tree (e.g., showing a red/slow Sequential Scan)*
*Figure 3: The "Index Lab" tab showing a suggested HypoPG index and the estimated time saved*
*Figure 4: The "Slow Queries" dashboard showing pg_stat_statements data*

**Recent Deployment Fixes (Milestone I):**
- Resolved `NameError: name 'Union' is not defined` in `schemas.py` that crashed the Render deploy.
- Fixed the `invalid length of startup packet` Render log spam by moving PostgreSQL from `listen_addresses='*'` to `'localhost'` and `port=5433` in `start.sh`.
- Fixed the `SET LOCAL can only be used in transaction blocks` application warnings by implementing proper `conn.transaction()` blocks in the FastAPI router.

---

## 10. Evidence
Check the `/evidence/` directory for generated logs and verification outputs:
- `dns_propagation.txt`: Output of dig/nslookup verification script.
- `server_setup.log`: Full output of the LEMP stack installation.
- `wp_setup_verification.txt`: SSL certificate and Nginx cURL verification results.
- `wordpress_setup.log`: Output of the WP-CLI build process.

---

## 11. Unfilled Placeholders (To-Do List)

The following metrics and variables must be filled using live external tools before launch:

### Content & Keyword Metrics (Ahrefs / Ubersuggest / Google Keyword Planner)
- [MUST VERIFY KD/Vol] `postgres explain visualizer`
- [MUST VERIFY KD/Vol] `how to read postgres explain`
- [MUST VERIFY KD/Vol] `fix slow query postgres`
- [MUST VERIFY KD/Vol] `tools to find slow queries postgres`
- [MUST VERIFY KD/Vol] `hypopg tutorial`
- [MUST VERIFY KD/Vol] `postgres index scan vs seq scan`
- [MUST VERIFY KD/Vol] `how to avoid seq scan postgres`
- [MUST VERIFY KD/Vol] `postgres composite index`
- [MUST VERIFY KD/Vol] `understand query planner postgres`
- [MUST VERIFY KD/Vol] `pg_stat_statements tutorial`
- [MUST VERIFY KD/Vol] `optimize joins postgres`
- [MUST VERIFY KD/Vol] `index only scan postgres`

### Competitor Backlink Profiles (Ahrefs / Ubersuggest)
- [FILL FROM AHREFS/UBERSUGGEST] Dalibo PEV2 - Referring Domains (RD)
- [FILL FROM AHREFS/UBERSUGGEST] Dalibo PEV2 - Total Backlinks
- [FILL FROM AHREFS/UBERSUGGEST] pganalyze - Referring Domains (RD)
- [FILL FROM AHREFS/UBERSUGGEST] pganalyze - Total Backlinks

### Infrastructure Constants (To be replaced in Scripts/Guides)
- `[DOMAIN]` - Must be swapped for the actual registered domain name.
- `[VPS_IP]` - Must be swapped for the assigned IPv4 address of the provisioned server.
- `[VERIFY: source]` - In `docs/01_niche.md`, source citations needed for "production DBs running at high CPU utilization" and "Postgres being the most popular database".

---

## 12. Evidence Index

This index tracks the generation and completion status of all required evidence files for Milestone I.

| Evidence Type | File Path / Location | Status | Notes |
| :--- | :--- | :--- | :--- |
| **DNS Propagation Log** | `/evidence/dns_propagation.txt` | 🟡 Missing | Script is ready (`scripts/check_dns.sh`). Must be run after changing Cloudflare nameservers. |
| **VPS Setup Log** | `/evidence/server_setup.log` | 🟡 Missing | Script is ready (`scripts/server_setup.sh`). Must be run after provisioning the VPS. |
| **WordPress Setup Log** | `/evidence/wordpress_setup.log` | 🟡 Missing | Script is ready (`scripts/wp_cli_setup.sh`). Must be run after domain mapping and DB creation. |
| **SSL/Nginx Verification** | `/evidence/wp_setup_verification.txt` | 🟡 Missing | Script is ready (`scripts/wp_domain_setup.sh`). Runs cURL and OpenSSL tests automatically. |
| **Niche Definition** | `/docs/01_niche.md` | 🟢 Exists | Completed and documented. |
| **Keyword Strategy** | `/research/keyword_strategy.md` | 🟢 Exists | Completed, though search volumes need Ahrefs verification. |
| **SERP & Competitor Data** | `/research/serp_analysis.md`, `/research/competitor_comparison.md` | 🟢 Exists | Completed. Backlink counts need verification. |
| **Site Architecture** | `/research/site_architecture.md` | 🟢 Exists | Completed and mapped to URLs. |
| **SEO Roadmap** | `/research/seo_roadmap.md` | 🟢 Exists | 4-Week sprint and 6-post calendar completed. |
| **Architecture Diagram** | Inside this report (Section 9) | 🟢 Exists | Mermaid chart generated. |
| **Marketing Screenshots** | Figure 1 - Figure 4 | 🟡 Missing | Placeholders exist in report. Must be captured from the live tool. |
| **Live GitHub Repo** | [GitHub Link](#9-querylens-github-and-render) | 🟢 Exists | Repository is live. |
| **Live Render App** | [Render Link](#9-querylens-github-and-render) | 🟢 Exists | Render service is live and routing properly. |
