import { useEffect, useState } from "react";

const today = new Date().toISOString().slice(0, 10);
const weekAgo = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);

export default function App() {
  const [from, setFrom] = useState(weekAgo);
  const [to, setTo] = useState(today);
  const [stats, setStats] = useState({
    uniqueVisitors: 0,
    popularPages: [],
    eventsPerDay: [],
  });

  useEffect(() => {
    async function loadStats() {
      const start = new Date(`${from}T00:00:00Z`);
      const end = new Date(`${to}T00:00:00Z`);
      end.setUTCDate(end.getUTCDate() + 1);

      const url = `http://localhost:3000/stats?from=${start.toISOString()}&to=${end.toISOString()}`;
      const res = await fetch(url).catch(() => null);
      if (res && res.ok) setStats(await res.json());
    }

    loadStats();
    const timer = setInterval(loadStats, 5000);
    return () => clearInterval(timer);
  }, [from, to]);

  return (
    <div
      style={{
        maxWidth: 850,
        margin: "40px auto",
        padding: 24,
        fontFamily: "Arial, sans-serif",
        color: "#222",
      }}
    >
      <h1>Analytics Dashboard</h1>
      <p>Monitor visitors and page view activity.</p>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <label>
          From:{" "}
          <input
            type="date"
            value={from}
            max={to}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          To:{" "}
          <input
            type="date"
            value={to}
            min={from}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>

      <hr style={{ margin: "24px 0" }} />

      <h2>Unique visitors</h2>
      <h2>{stats.uniqueVisitors}</h2>

      <h2>Popular Pages</h2>
      <ul>
        {stats.popularPages.map((page) => (
          <li key={page.url}>
            {page.url}: {page.views} views
          </li>
        ))}
      </ul>

      <h2>Events per Day</h2>
      <ul>
        {stats.eventsPerDay.map((day) => (
          <li key={day.day}>
            {day.day}: {day.events} events
          </li>
        ))}
      </ul>
    </div>
  );
}
