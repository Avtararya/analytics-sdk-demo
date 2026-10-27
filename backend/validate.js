export function isValidEvent(e) {
  return Boolean(
    e &&
    e.eventId &&
    e.name &&
    e.visitorId &&
    e.timestamp &&
    !isNaN(new Date(e.timestamp)),
  );
}
