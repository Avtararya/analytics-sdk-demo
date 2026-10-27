import test from "node:test";
import assert from "node:assert/strict";
import { isValidEvent } from "./validate.js";

const good = {
  eventId: "e1",
  name: "page_view",
  visitorId: "v1",
  timestamp: "2026-10-27T10:00:00Z",
};

test("accepts a complete event", () => {
  assert.equal(isValidEvent(good), true);
});

test("rejects an event with no name", () => {
  assert.equal(isValidEvent({ ...good, name: undefined }), false);
});

test("rejects an event with a bad timestamp", () => {
  assert.equal(isValidEvent({ ...good, timestamp: "not-a-date" }), false);
});
