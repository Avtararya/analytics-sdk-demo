# Analytics SDK Demo

A small analytics system with a browser SDK, a server tracking helper, an ingestion API, Postgres storage, and a React dashboard. A demo restaurant page shows the full flow: page visits and clicks in the browser, an order created on the server, and the numbers on the dashboard.

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
- **Dashboard:** Calls the stats API and shows unique visitors, popular pages, and events per day, with a date filter. It refreshes every 5 seconds.

## Setup

Requirements: Node 20.19 or newer, and Postgres running locally.

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

Run the tests with `npm test` inside the `backend` folder.

## SDK usage

```js
const analytics = new Analytics();
analytics.init({ apiKey: "abc123" });
analytics.page();                                    // record a page view
analytics.track("add_to_cart", { item: "Pizza" });   // record a custom event
```

Server side:

```js
const tracker = new ServerTracker({ endpoint: "http://localhost:3000/events", apiKey: "abc123" });
await tracker.track("order_created", visitorId, { item: "Pizza" });
```

## Event format

`eventId` (unique), `name`, `visitorId`, `sessionId`, `url` (page path), `properties` (free-form object), `timestamp` (ISO).

## Key decisions and tradeoffs

- **Visitor identity:** The SDK saves a random id in `localStorage`, so the same browser keeps the same id across visits. A session id in `sessionStorage` marks one tab visit. A visitor therefore means a browser, not a person.
- **Batching:** Events are sent every 5 seconds, when 10 are waiting, or when the tab closes. This means fewer requests and a faster page.
- **Retries and duplicates:** If a send fails because of a network error or a 5xx response, the events go back in the queue (capped at 100) and are retried. Every event has a unique `eventId`, and the database skips an id it already has, so a retry never counts twice. A 4xx response, such as a wrong key, is not retried.
- **Server events:** Orders are tracked on the server because the browser can be blocked or faked. They go through the same `/events` API and key check as browser events. If tracking fails, it is only logged, so the customer's order still succeeds.
- **UTC days:** Daily counts are grouped in UTC, so the numbers do not change with the server or browser timezone.
- **Safe queries:** All dashboard queries use parameters, and an index on `occurred_at` keeps date-range queries fast.

## Assumptions

- One demo site and one shared API key.
- Event timestamps come from the browser clock and are trusted.
- A unique visitor is one distinct browser id.

## Known limitations

- The API key is visible in the browser, so it identifies the site but is not a real secret.
- `/stats` has no login, and CORS is open to all origins.
- There is no rate limiting on `/events`.
- The queue is kept in memory, so events are lost if the tab closes while the server is down.
- Events are inserted one at a time, not in bulk.
- Stats are calculated live from raw events, with no pre-calculated totals.
- Only the event validation is covered by tests, and there are no API-level tests yet.
- The dashboard shows the last 7 days by default (UTC dates). It refreshes every 5 seconds, so each open dashboard runs the 3 stats queries every 5 seconds, which is fine for a demo but not for many viewers.
- If the backend is down, the dashboard keeps showing the last numbers and gives no error message.
