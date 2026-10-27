CREATE TABLE events (
  event_id    TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  visitor_id  TEXT NOT NULL,
  session_id  TEXT,
  url         TEXT,
  properties  JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_occurred_at ON events (occurred_at);