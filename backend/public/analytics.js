class Analytics {
  #apiKey = null;
  #endpoint = "/events";
  #visitorId = null;
  #sessionId = null;
  #queue = [];
  #batchSize = 10;
  #maxQueue = 100;

  init(config) {
    this.#apiKey = config.apiKey;
    if (config.endpoint) this.#endpoint = config.endpoint;
    this.#visitorId = this.#getId("localStorage", "visitor_id");
    this.#sessionId = this.#getId("sessionStorage", "session_id");
    setInterval(() => this.#flush(), 5000);
    window.addEventListener("pagehide", () => this.#flush());
  }

  getVisitorId() {
    return this.#visitorId;
  }

  page() {
    this.track("page_view", { title: document.title });
  }

  track(name, properties = {}) {
    const event = {
      eventId: crypto.randomUUID(),
      name,
      properties,
      visitorId: this.#visitorId,
      sessionId: this.#sessionId,
      url: location.pathname,
      timestamp: new Date().toISOString(),
    };
    this.#queue.push(event);
    if (this.#queue.length > this.#maxQueue) this.#queue.shift();
    if (this.#queue.length >= this.#batchSize) this.#flush();
  }

  async #flush() {
    if (this.#queue.length === 0) return;
    const batch = this.#queue.splice(0, this.#queue.length);
    try {
      const res = await fetch(this.#endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: this.#apiKey, events: batch }),
        keepalive: true,
      });
      if (res.status >= 500) throw new Error("server error");
    } catch (e) {
      this.#queue.unshift(...batch);
      if (this.#queue.length > this.#maxQueue) {
        this.#queue.splice(0, this.#queue.length - this.#maxQueue);
      }
    }
  }

  #getId(storageName, key) {
    try {
      const storage = window[storageName];
      let id = storage.getItem(key);
      if (!id) {
        id = crypto.randomUUID();
        storage.setItem(key, id);
      }
      return id;
    } catch (e) {
      return crypto.randomUUID();
    }
  }
}
