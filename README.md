# QueryLens

![CI](https://github.com/Divyansh-h/QueryLens/actions/workflows/ci.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18-blue.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-green.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)

QueryLens is a beautiful, interactive educational sandbox for mastering PostgreSQL execution plans and query optimization. It parses raw `EXPLAIN` outputs into an interactive tree, highlights performance bottlenecks using an automated heuristic engine, and provides a safe "Index Lab" to test optimizations without affecting production.

## Features
- **Visual Plan Analyzer**: Paste any JSON `EXPLAIN` plan (or write a query) to visualize the execution tree, complete with node-specific metrics and filters.
- **Automated Insights**: Instantly detects Sequential Scans, missing indexes, unoptimized CTEs, and expensive nested loops.
- **Index Lab**: A safe environment to propose, apply, and measure the ROI of indexes before running them in production.
- **Slow Queries Dashboard**: View and sort historical performance data straight from `pg_stat_statements`.
- **Learn Mode & Datasets**: Built-in gamified challenges on a seeded e-commerce dataset to test your optimization skills.

## Screenshots

*(Placeholders for screenshots)*
![Analyzer View](docs/analyzer_screenshot.png)
![Index Lab](docs/index_lab_screenshot.png)
![Datasets Challenge](docs/datasets_screenshot.png)

## Architecture

QueryLens uses a modern web stack designed for speed and safety:

- **Frontend**: React (Vite) + Tailwind CSS, featuring Monaco Editor for SQL and a custom recursive tree component for execution plans.
- **Backend**: FastAPI (Python), utilizing `asyncpg` for high-performance, asynchronous database operations.
- **Database**: PostgreSQL 15 running in Docker, pre-configured with `pg_stat_statements`.
- **Security**: All user-submitted queries run inside a strict `READ ONLY` transaction that is automatically rolled back, enforced with a short `statement_timeout` to prevent resource exhaustion. 

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (v18+)
- Python (3.9+)

### Installation

1. **Start the Database**
   ```bash
   docker-compose up -d
   ```
   *This spins up PostgreSQL and automatically runs `scripts/seed.sql` to populate the 3 million row e-commerce dataset.*

2. **Start the Backend**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Start the Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
