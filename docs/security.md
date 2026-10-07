# Security & Hardening Risks

QueryLens is designed as a sandbox environment. While many layers of security have been implemented to allow safe execution of arbitrary user-submitted SQL, there are still inherent risks when running an open SQL execution endpoint on the internet.

## Implemented Mitigations

1. **Role-Based Access Control (RBAC):**
   - The API uses a strict `querylens_ro` read-only role for the `/api/explain` endpoint. This role only has `GRANT SELECT` permissions, preventing users from executing `INSERT`, `UPDATE`, `DELETE`, or `DROP` commands.
   - A separate `querylens_admin` role is reserved for endpoints that must modify the database structure (e.g., the Index Lab creating hypothetical or real indexes, and resetting `pg_stat_statements`).

2. **Transaction Rollbacks & Timeouts:**
   - Every user-submitted query via `/api/explain` is executed inside a `SET TRANSACTION READ ONLY` block that is unconditionally rolled back (`await conn.rollback()`), ensuring no side effects leak.
   - A strict 10-second `statement_timeout` is applied locally to every query to prevent CPU starvation and denial-of-service (DoS) attacks via computationally expensive queries (e.g., recursive CTEs or massive cartesian joins).

3. **Rate Limiting:**
   - The `/api/explain` endpoint is protected by a strict rate limit (`20 requests per minute` per IP) using `slowapi`.

4. **Connection Pooling:**
   - Asynchronous connection pooling limits the number of concurrent connections to the database to prevent connection exhaustion.

5. **CORS Restrictions:**
   - `ALLOWED_ORIGINS` restricts cross-origin requests exclusively to the deployed Render domain, preventing cross-site request forgery (CSRF) and unwanted embedding.

## Residual Risks

1. **Denial of Service (CPU / RAM):**
   - Even with a 10-second timeout, a coordinated attack issuing heavy queries (like cross-joins) up to the rate limit could consume significant CPU/RAM on the Render Free Tier (limited to 512MB RAM), potentially causing OOM kills.
   - **Mitigation:** The rate limiter and strict concurrent connection limits heavily throttle this.

2. **Information Disclosure (Side-Channel):**
   - Since users can submit arbitrary SQL to read the schema, they can extract the structure of the sandbox data. Because the data is explicitly dummy/seeded data, this is not a confidentiality risk. However, they could potentially read PostgreSQL internals (`pg_class`, `pg_stat_activity` if permissions allow).

3. **Zero-Day Postgres Vulnerabilities:**
   - Allowing arbitrary SQL execution always carries the risk of a zero-day privilege escalation vulnerability within PostgreSQL itself.

4. **Resource Exhaustion via Index Lab:**
   - The Index Lab uses the `admin` role to create real indexes. While the API limits inputs to `CREATE INDEX` statements, a malicious user could potentially create an excessive number of indexes, exhausting disk space.

*Conclusion: The sandbox is safe for its intended educational purpose and robust enough for public deployment, but it must never be connected to a production database containing PII or sensitive business data.*
