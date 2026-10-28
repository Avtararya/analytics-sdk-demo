import { useEffect, useState } from "react";

export default function App() {
  const [from, setFrom] = useState("2026-10-26");
  const [to, setTo] = useState("2026-10-28");

  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let cancelled = false;
    let timer;
    let controller;

    async function loadStats() {
      controller = new AbortController();

      try {
        const start = new Date(`${from}T00:00:00Z`);
        const end = new Date(`${to}T00:00:00Z`);

        // Include the entire "To" date.
        end.setUTCDate(end.getUTCDate() + 1);

        const url = new URL("http://localhost:3000/stats");
        url.searchParams.set("from", start.toISOString());
        url.searchParams.set("to", end.toISOString());

        const response = await fetch(url, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Failed to load analytics");
        }

        const data = await response.json();

        if (!cancelled) {
          setStats(data);
          setError("");
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (!cancelled && err.name !== "AbortError") {
          setError(err.message || "Something went wrong");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);

          // Refresh dashboard every 5 seconds.
          timer = setTimeout(loadStats, 5000);
        }
      }
    }

    setLoading(true);
    setStats(null);
    setError("");

    loadStats();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      controller?.abort();
    };
  }, [from, to]);

  const pizzaCount = Number(stats?.addToCartCount ?? 0);
  const visitors = Number(stats?.uniqueVisitors ?? 0);
  const popularPages = stats?.popularPages ?? [];
  const eventsPerDay = stats?.eventsPerDay ?? [];

  const hasData =
    visitors > 0 ||
    pizzaCount > 0 ||
    popularPages.length > 0 ||
    eventsPerDay.length > 0;

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

      <p>Monitor visitors, page views activity.</p>

      {/* Date filters */}
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

      {/* Loading state */}
      {loading && !stats && <p>Loading analytics...</p>}

      {/* Error state */}
      {error && (
        <p role="alert" style={{ color: "crimson" }}>
          Unable to refresh analytics: {error}
        </p>
      )}

      {/* Empty state */}
      {!loading && !error && stats && !hasData && (
        <div
          style={{
            textAlign: "center",
            padding: 40,
            border: "1px dashed #ccc",
            borderRadius: 12,
          }}
        >
          <h2>No analytics data yet</h2>
          <p>
            No activity was found for the selected dates. Try another date range
            or add a pizza on the demo website.
          </p>
        </div>
      )}

      {/* Analytics data */}
      {stats && hasData && (
        <>
          <h2>Overview</h2>

          <div>
            <p>Unique visitors</p>
            <h2>{visitors}</h2>
          </div>

          <h2>Popular Pages</h2>

          {popularPages.length > 0 ? (
            <ul>
              {popularPages.map((page) => (
                <li key={page.url}>
                  {page.url}: {page.views} views
                </li>
              ))}
            </ul>
          ) : (
            <p>No popular pages recorded.</p>
          )}

          <h2>Events per Day</h2>

          {eventsPerDay.length > 0 ? (
            <ul>
              {eventsPerDay.map((day) => (
                <li key={day.day}>
                  {day.day}: {day.events} events
                </li>
              ))}
            </ul>
          ) : (
            <p>No daily events recorded.</p>
          )}
        </>
      )}
    </div>
  );
}
