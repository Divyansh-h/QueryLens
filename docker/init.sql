-- Configure the server to preload pg_stat_statements
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';

-- Enable the extensions in the default database
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
CREATE EXTENSION IF NOT EXISTS hypopg;
