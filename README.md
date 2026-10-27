# Analytics SDK Demo

This is Analytics SDK Project for tracking incoming trffic and analyse and counting tham for records of data

## Architecture

```
Browser SDK ──┐
              ├──> POST /events ──> Postgres ──> GET /stats ──> React dashboard
Server helper ┘
```

- **Browser SDK:** \_\_\_\_
- **Server helper:** \_\_\_\_
- **API:** \_\_\_\_
- **Database:** \_\_\_\_
- **Dashboard:** \_\_\_\_

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
