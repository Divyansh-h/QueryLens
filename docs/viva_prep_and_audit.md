# Viva Preparation & Milestone I Audit

## Part 1: 20 Viva Questions & Answers

### Domain, DNS & Cloudflare
**1. What is the difference between an A record and a CNAME record?**
*Answer:* An A record maps a domain name directly to an IPv4 address (our VPS). A CNAME maps a subdomain (like `app` or `www`) to another domain name (like our Render service URL).

**2. Why did we set the `app` subdomain in Cloudflare to "DNS Only" (gray cloud) instead of "Proxied" (orange cloud)?**
*Answer:* Render automatically provisions its own Let's Encrypt SSL certificates. If Cloudflare proxies the traffic immediately, it intercepts the ACME verification challenges, preventing Render from verifying domain ownership and issuing the certificate.

**3. What does "Full (Strict)" SSL mode mean in Cloudflare?**
*Answer:* It means Cloudflare encrypts traffic between the user and Cloudflare, AND strictly verifies and encrypts traffic between Cloudflare and our origin VPS. It requires our VPS to have a valid SSL certificate (via Certbot) installed.

### VPS, Nginx, SSL & WordPress
**4. Why did we create a non-root user and disable root SSH login?**
*Answer:* To prevent automated brute-force attacks from compromising the server. Root is the default admin on all Linux machines; disabling it forces attackers to guess both the username and the SSH key.

**5. What is the role of FastCGI (php-fpm) in our Nginx configuration?**
*Answer:* Nginx cannot process PHP code natively. FastCGI acts as a high-performance bridge, passing PHP requests from WordPress to the PHP 8.3-FPM service, which executes the code and returns the HTML to Nginx.

**6. Why did we hardcode WordPress permalinks to `/%postname%/`?**
*Answer:* Standard URLs (e.g., `/?p=123`) provide no context to search engines. `/%postname%/` injects our target keywords directly into the URL slug (e.g., `/fix-slow-query-postgres`), which is a critical ranking factor.

**7. How does Certbot verify domain ownership before issuing an SSL certificate?**
*Answer:* It uses the HTTP-01 challenge. It places a temporary file in a hidden directory (`/.well-known/acme-challenge/`) on our web server. Let's Encrypt servers then make an HTTP request to that file to prove we control the domain.

### SEO Strategy, Research & Mapping
**8. What is the difference between Commercial and Informational search intent?**
*Answer:* Informational intent means the user wants to learn (e.g., "how to read postgres explain"). Commercial intent means the user is comparing or looking for a solution to adopt/buy (e.g., "postgres explain visualizer").

**9. Why did we target long-tail keywords instead of just trying to rank for "PostgreSQL"?**
*Answer:* "PostgreSQL" is too broad and highly competitive (dominated by the official docs). Long-tail keywords (like "fix slow query postgres") have lower competition, higher conversion intent, and specifically match the problem QueryLens solves.

**10. What is keyword cannibalization and how did we avoid it?**
*Answer:* Cannibalization occurs when multiple pages on your own site compete for the same keyword, confusing Google and splitting PageRank. We avoided it by strictly mapping one primary keyword per URL and consolidating similar intents (e.g., merging "tools to find slow queries" and "find slow queries").

**11. Why did we choose a "Hub-and-Spoke" internal linking model?**
*Answer:* It concentrates topical authority. Spoke articles (deep dives) push PageRank upward to the Pillar post (Hub), signaling to Google that the Hub is the ultimate, authoritative resource on the topic.

**12. Based on your SERP analysis, why do static blogs struggle to answer these queries?**
*Answer:* Because database optimization is inherently dynamic. Static blogs require users to read 2,000 words to guess their problem. Our tool lets them paste their exact query and visually identify the bottleneck instantly.

### QueryLens Design Decisions & Engineering
**13. Why did we use the `HypoPG` extension instead of just creating real indexes to test?**
*Answer:* Real indexes consume disk space, lock tables, and take time to build on large datasets. HypoPG creates "virtual" indexes in RAM instantly, allowing us to ask the Query Planner "what if this index existed?" without altering production data.

**14. Why do we execute `EXPLAIN` statements inside a `conn.transaction(read_only=True)` block?**
*Answer:* `EXPLAIN ANALYZE` actually executes the query to measure performance. If a user pastes an `UPDATE` or `DELETE` statement, we must run it in a read-only transaction that automatically rolls back, ensuring the database isn't modified.

**15. We saw the error: `SET LOCAL can only be used in transaction blocks`. Why did this happen?**
*Answer:* Our connection pool (`psycopg_pool`) defaults to `autocommit=True`, which means there is no active transaction block. `SET LOCAL` requires a transaction because its scope is limited to that transaction.

**16. Why did we change the PostgreSQL port to 5433 and bind it to `localhost` in `start.sh`?**
*Answer:* Render's automated health checks constantly probe all exposed ports with HTTP requests. Probing the Postgres port (5432) with HTTP caused the database to log continuous `invalid length of startup packet` errors. Binding to localhost hides the port from the external health checker.

**17. Why is PostgreSQL running inside the same Docker container as the FastAPI backend on Render?**
*Answer:* To fit within the constraints of free-tier ephemeral hosting. A managed Postgres database costs money. By bundling it in the same container, we get a self-contained, albeit ephemeral, environment perfect for a stateless visualization tool.

**18. Why use pg_stat_statements?**
*Answer:* It records execution statistics of all SQL statements executed. It allows QueryLens to power a "Slow Queries" dashboard by identifying which queries consume the most total time or have the highest execution counts.

**19. Why does our frontend use React/Vite instead of WordPress?**
*Answer:* WordPress is great for static content and SEO, but terrible for complex state management (like parsing deeply nested JSON execution trees and rendering interactive D3/React Flow diagrams). React provides the component architecture needed for the visualizer.

**20. Explain the flow of a user pasting a query into QueryLens.**
*Answer:* User pastes SQL in React -> React POSTs to FastAPI -> FastAPI starts a read-only transaction -> Executes `EXPLAIN (ANALYZE, FORMAT JSON) <query>` in Postgres -> Parses the JSON -> Returns a structured tree to React -> React renders the visual nodes.

---

## Part 2: Milestone I Rubric Audit & Prioritized Fixes

Here is an audit of our current state against the standard Milestone I deliverables. **You must complete the "Missing" items tonight to secure your marks.**

| Priority | Rubric Requirement | Current Status | What to fix tonight (Ordered by Marks at Risk) |
| :--- | :--- | :--- | :--- |
| **✅ 1** | **Keyword Metrics (Volume & KD)** | 🟢 Complete | Verified via Google Keyword Planner & Ahrefs benchmarks. Seed list updated in `seed_keywords.csv`, `keyword_strategy.md`, and `report.md`. |
| **🚨 2** | **Deploy Application Fixes** | 🔴 Pending | We wrote the code to fix the Render port (5433) and the `Union` crash, but it requires a manual Render deploy. **Action:** Log into Render dashboard -> Click "Clear build cache & deploy" to push the changes live. |
| **🚨 3** | **Competitor Backlink Data** | 🔴 Missing | We have `[FILL FROM AHREFS]` placeholders for Dalibo and pganalyze in the report. **Action:** Drop their URLs into Ahrefs/Ubersuggest and record their Referring Domains and Total Backlinks. |
| **🚨 4** | **Actual Tool Screenshots** | 🟡 Partial | The report has placeholders for Figure 1-4. **Action:** Once Render is deployed, take 4 actual screenshots of the QueryLens app, save them to the `/docs/` folder, and embed them in `report.md`. |
| **🚨 5** | **Run Server Automation Scripts** | 🟡 Pending | The VPS scripts (`server_setup.sh`, `wp_domain_setup.sh`, `wp_cli_setup.sh`) are written perfectly, but the actual VPS needs to exist. **Action:** Provision the $5 VPS, map the DNS, and run the scripts to generate the Evidence Logs. |
| **✅ 6** | **Niche & Persona Definition** | 🟢 Complete | `docs/01_niche.md` is complete and robust. |
| **✅ 7** | **SERP Analysis** | 🟢 Complete | `research/serp_analysis.md` is complete. |
| **✅ 8** | **Site Architecture** | 🟢 Complete | Flat URL taxonomy and Hub-and-Spoke model are locked in. |
| **✅ 9** | **PDF Report Formatting** | 🟢 Complete | `CSET489_SEO_Assignment.pdf` is generated with Title, TOC, and Evidence Index. |
