const normalizeLocation = (location) => location?.trim().toLocaleLowerCase() || null;

/**
 * Reports schedule conflicts between events. Intervals are half-open, so an
 * event ending exactly when another starts is not a conflict.
 */
export function findEventConflicts(events, rsvps = []) {
  const attendeesByEvent = new Map();
  for (const rsvp of rsvps) {
    if (!attendeesByEvent.has(rsvp.event_id)) attendeesByEvent.set(rsvp.event_id, new Set());
    attendeesByEvent.get(rsvp.event_id).add(rsvp.user_id);
  }

  const conflicts = [];
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      const a = events[i];
      const b = events[j];
      if (!a.start_date || !a.end_date || !b.start_date || !b.end_date) continue;

      const aStart = new Date(a.start_date).getTime();
      const aEnd = new Date(a.end_date).getTime();
      const bStart = new Date(b.start_date).getTime();
      const bEnd = new Date(b.end_date).getTime();
      if (![aStart, aEnd, bStart, bEnd].every(Number.isFinite)) continue;
      if (!(aStart < bEnd && bStart < aEnd)) continue;

      const aUsers = attendeesByEvent.get(a.id) || new Set();
      const bUsers = attendeesByEvent.get(b.id) || new Set();
      const sharedUsers = [...aUsers].filter((userId) => bUsers.has(userId));
      const sameLocation = normalizeLocation(a.location_name) !== null
        && normalizeLocation(a.location_name) === normalizeLocation(b.location_name);

      conflicts.push({
        eventA: { id: a.id, title: a.title, start: a.start_date, end: a.end_date, location: a.location_name },
        eventB: { id: b.id, title: b.title, start: b.start_date, end: b.end_date, location: b.location_name },
        overlaps: true,
        sharedUsersCount: sharedUsers.length,
        sharedUsers,
        severity: sameLocation ? "critical" : "warning",
      });
    }
  }
  return conflicts;
}
