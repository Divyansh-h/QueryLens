# Stage 1: Build Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
ENV VITE_API_BASE_URL=/api
RUN npm run build

# Stage 2: Final Image
FROM postgres:16-bookworm

# Install Python, HypoPG dependencies, and supervisor
RUN apt-get update && apt-get install -y \
    python3 python3-pip python3-venv \
    postgresql-16-hypopg \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Set up Python environment
WORKDIR /opt/querylens
RUN python3 -m venv venv
COPY backend/requirements.txt .
RUN ./venv/bin/pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app ./app

# Copy built frontend
COPY --from=frontend-builder /app/dist ./static

# Setup scripts
COPY docker/init.sql ./scripts/init.sql
COPY scripts/seed.sql ./scripts/seed.sql
COPY start.sh ./start.sh
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

RUN chmod +x ./start.sh

EXPOSE 8000
CMD ["/opt/querylens/start.sh"]
