import { useEffect, useState } from "react";

export default function App() {
  const [from, setFrom] = useState("2026-10-26");
  const [to, setTo] = useState("2026-10-28");
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const start = new Date(from + "T00:00:00Z");
    const end = new Date(to + "T00:00:00Z");
    end.setUTCDate(end.getUTCDate() + 1); // include the whole "to" day

    setError("");
    fetch(
      `http://localhost:3000/stats?from=${start.toISOString()}&to=${end.toISOString()}`,
    )
      .then((res) => {
        if (!res.ok) throw new Error("request failed");
        return res.json();
      })
      .then(setStats)
      .catch((e) => setError(e.message));
  }, [from, to]);

  return (
    <div>
      <h1>Analytics</h1>
      <label>
        From:{" "}
        <input
          type="date"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        />
      </label>{" "}
      <label>
        To:{" "}
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </label>
      {error && <p>Error: {error}</p>}
      {!stats && !error && <p>Loading...</p>}
      {stats && (
        <>
          <p>Unique visitors: {stats.uniqueVisitors}</p>

          <h2>Popular pages</h2>
          <ul>
            {stats.popularPages.map((p) => (
              <li key={p.url}>
                {p.url}: {p.views} views
              </li>
            ))}
          </ul>

          <h2>Events per day</h2>
          <ul>
            {stats.eventsPerDay.map((d) => (
              <li key={d.day}>
                {d.day}: {d.events} events
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
