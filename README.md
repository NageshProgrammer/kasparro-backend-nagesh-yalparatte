# Kasparro Backend & Crypto ETL System (Updated)

## Overview
This updated submission implements the required **Crypto Data ETL** domain and uses **PostgreSQL** as the relational database. It fetches data from CoinGecko, CoinPaprika, and also supports ingesting a CSV file of historical prices. The system normalizes coins by name/symbol and stores both coin metadata and price snapshots.

## Tech Stack
- Node.js (Express)
- PostgreSQL
- node-postgres (pg)
- node-fetch
- csv-parse
- Docker + docker-compose (for app + postgres)

## What changed from previous submission
- Replaced MongoDB with PostgreSQL and relational schema
- Implemented ETL fetching data from CoinGecko & CoinPaprika and CSV ingestion
- Added Dockerfile and docker-compose.yml to orchestrate app + postgres
- Added migration/init script to create tables
- Added README and sample CSV

## Quick Start (local)
1. Copy .env example:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Initialize database (ensure PostgreSQL is running and DATABASE_URL points to it):
   ```bash
   npm run migrate
   ```
4. Run ETL manually:
   ```bash
   npm run etl
   ```
5. Start server (optional):
   ```bash
   npm run dev
   ```

## Docker (recommended)
Bring up app + Postgres with Docker Compose:
```bash
docker-compose up --build
```
This will create a postgres instance and the app. The app will be reachable at `http://localhost:3000` (if PORT=3000).

## API Endpoints (examples)
- `GET /health` - health check
- `POST /api/ingest/csv` - upload CSV (not implemented file upload in this example; use script)
- `POST /api/coins/sync` - trigger ETL sync from external APIs
- `GET /api/coins` - list normalized coins
- `GET /api/prices/latest` - latest price snapshots

## Schema (relational)
- `coins` (id, name, symbol, coingecko_id, coinpaprika_id, created_at)
- `prices` (id, coin_id, source, price, fetched_at)

## Notes
- The ETL logic performs simple name/symbol matching to normalize coins across sources.
- For production-grade normalization you may need a curated mapping table; we provide heuristics here.
- You must set `DATABASE_URL` in `.env` or use Docker Compose which wires the DB container.

## Author
Nagesh Yalparatte
=======
# Kasparro Backend & ETL System

Backend service with a lightweight ETL pipeline. Raw events are ingested via API, transformed, and stored as processed records while tracking processing status.

## Tech Stack
- Node.js + Express
- MongoDB (Atlas or local)
- Mongoose ODM
- Nodemon for local dev

## Quickstart
1) Install deps: `npm install`
2) Configure env: create `.env` with at least `MONGO_URI` (and optional `PORT`, default 3000)
3) Run dev server: `npm run dev`
4) Server runs at `http://localhost:3000`

## Environment Variables
- `MONGO_URI` (required): Mongo connection string
- `PORT` (optional): server port, defaults to 3000

## API
- `GET /health` — basic liveness check
- `POST /api/ingest` — store a raw event
  - Example body:
    ```json
    {
      "userId": 101,
      "eventType": "signup",
      "source": "web"
    }
    ```
  - Response: `201 Created` with ingested `id`
- `POST /api/data/run-etl` — trigger ETL over pending raw events
- `GET /api/data` — list processed events (latest first)

## ETL Flow
- Extract: fetch raw events where `status=pending`
- Transform: enrich payload (adds `processedAt`, keeps original fields)
- Load: write to `processedevents` with `sourceId` back-reference
- Mark source: set raw event status to `processed` or `failed` with error

## Data Models
- `RawEvent`: `{ payload: Object, status: pending|processed|failed, errorMessage }` + timestamps
- `ProcessedEvent`: `{ sourceId: ObjectId(ref RawEvent), processedData: Object }` + timestamps

## Notes
- Intended for local testing or as a starting point for a fuller pipeline
- No automated tests are defined; use Postman/cURL for manual checks
