# Analytics SDK Demo

This is Analytics SDK Project for tracking incoming trffic and analyse and counting tham for records of data

## Architecture

```
Browser SDK ──┐
              ├──> POST /events ──> Postgres ──> GET /stats ──> React dashboard
Server helper ┘
```

- **Browser SDK:** Tracks visitor actions, creates visitor and session IDs, queues events, and sends them to the backend.
- **Server helper:** Tracks events that happen on the server, such as successful orders, and sends them to the API.
- **API:** Receives events, validates the API key and input, and saves valid events to the database.
- **Database:** Stores events with unique event IDs to prevent duplicate records.
- **Dashboard:** Calls the stats API and displays analytics, such as total events, visitors, and daily activity.

## Setup

Requirements: Node 18 or newer, and Postgres running locally.

```
createdb analytics
psql analytics -f backend/schema.sql
cp backend/.env.example backend/.env
```

Backend (terminal 1):

```
cd backend
npm install
npm run dev
```

Dashboard (terminal 2):

```
cd frontend
npm install
npm run dev
```

- Demo restaurant page: http://localhost:3000
- Dashboard: http://localhost:5173

`API_KEY=abc123` in `.env.example` is a demo key only.
