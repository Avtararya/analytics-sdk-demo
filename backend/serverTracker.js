export class ServerTracker {
  #endpoint;
  #apiKey;

  constructor({ endpoint, apiKey }) {
    this.#endpoint = endpoint;
    this.#apiKey = apiKey;
  }

  async track(name, visitorId, properties = {}) {
    const event = {
      eventId: crypto.randomUUID(),
      name,
      visitorId,
      properties,
      timestamp: new Date().toISOString(),
    };
    try {
      const res = await fetch(this.#endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: this.#apiKey, events: [event] }),
      });
      if (!res.ok) console.error("tracking rejected", res.status);
    } catch (err) {
      console.error("tracking failed", err.message);
    }
  }
}
