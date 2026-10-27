import "dotenv/config";
import express from "express";
import cors from "cors";
import pg from "pg";
import { ServerTracker } from "./serverTracker.js";
import { isValidEvent } from "./validate.js";
if (!process.env.API_KEY || !process.env.DATABASE_URL) {
  console.error("Missing API_KEY or DATABASE_URL");
  process.exit(1);
}
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
const API_KEY = process.env.API_KEY;

const tracker = new ServerTracker({
  endpoint: "http://localhost:3000/events",
  apiKey: API_KEY,
  // apiKey: "WRONG_KEY",
});

app.post("/events", async (req, res) => {
  const { apiKey, events } = req.body;

  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: "invalid api key" });
  }
  if (!Array.isArray(events)) {
    return res.status(400).json({ error: "events must be an array" });
  }

  const valid = events.filter(isValidEvent);
  try {
    let stored = 0;
    for (const e of valid) {
      const r = await pool.query(
        `INSERT INTO events
           (event_id, name, visitor_id, session_id, url, properties, occurred_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (event_id) DO NOTHING`,
        [
          e.eventId,
          e.name,
          e.visitorId,
          e.sessionId,
          e.url,
          e.properties || {},
          e.timestamp,
        ],
      );
      stored += r.rowCount;
    }
    res.status(200).json({
      stored,
      duplicates: valid.length - stored,
      rejected: events.length - valid.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "could not store events" });
  }
});

app.get("/stats", async (req, res) => {
  const from = new Date(req.query.from);
  const to = new Date(req.query.to);

  if (isNaN(from) || isNaN(to) || from >= to) {
    return res.status(400).json({
      error: "from and to must be valid dates, and from must be before to",
    });
  }

  const range = [from.toISOString(), to.toISOString()];

  try {
    const [visitors, pages, trend] = await Promise.all([
      pool.query(
        `SELECT COUNT(DISTINCT visitor_id)::int AS unique_visitors
         FROM events WHERE occurred_at >= $1 AND occurred_at < $2`,
        range,
      ),
      pool.query(
        `SELECT url, COUNT(*)::int AS views
         FROM events
         WHERE name = 'page_view' AND url IS NOT NULL
           AND occurred_at >= $1 AND occurred_at < $2
         GROUP BY url ORDER BY views DESC LIMIT 5`,
        range,
      ),
      pool.query(
        `SELECT to_char(date_trunc('day', occurred_at AT TIME ZONE 'UTC'), 'YYYY-MM-DD') AS day,
                COUNT(*)::int AS events
         FROM events WHERE occurred_at >= $1 AND occurred_at < $2
         GROUP BY day ORDER BY day`,
        range,
      ),
    ]);

    res.json({
      uniqueVisitors: visitors.rows[0].unique_visitors,
      popularPages: pages.rows,
      eventsPerDay: trend.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "could not load stats" });
  }
});

app.post("/orders", async (req, res) => {
  const { visitorId, item } = req.body;
  if (!visitorId || !item) {
    return res.status(400).json({ error: "visitorId and item are required" });
  }
  await tracker.track("order_created", visitorId, { item });
  res.status(201).json({ ok: true });
});

app.listen(3000, () => console.log("server running"));
