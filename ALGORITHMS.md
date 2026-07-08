# Mahotsav — Algorithm Design Notes

Candidate non-trivial algorithms for the platform, beyond basic CRUD. These
reuse data the platform already collects. Ordered by recommended priority.
Nothing here is implemented yet — this is a design record.

---

## 1. Travel-time-aware conflict detection ⭐ recommended

### Problem

The current conflict detector (`server/src/controllers/groups.js` →
`groupConflicts`) marks two sub-events as conflicting only when their time
intervals overlap, and grades severity as `critical` only when the
`location_name` strings match. It ignores the `latitude` / `longitude`
fields already stored on every event.

Real-world case: two sessions don't overlap in time, but they're 800 m apart
with only a 5-minute gap — a student physically cannot attend both. The
current code reports no conflict.

### Approach

Use the **Haversine formula** (great-circle distance between two lat/long
points) plus a walking-speed division to decide whether a student can get
from one session to the next.

```
distance    = haversine(lat1, lon1, lat2, lon2)   // meters
travel_time = distance / walking_speed            // seconds
conflict if:  gap_between_sessions < (travel_time + buffer)
```

Haversine:

```
a = sin²(Δφ/2) + cos φ1 · cos φ2 · sin²(Δλ/2)
c = 2 · atan2(√a, √(1−a))
d = R · c
```

### Parameters

| Parameter        | Value / source                         |
| ---------------- | -------------------------------------- |
| Coordinates      | `events.latitude`, `events.longitude`  |
| Walking speed    | ~1.4 m/s (tunable constant)            |
| Buffer           | ~5 min setup / wind-down (tunable)     |
| Earth radius `R` | 6371 km (Haversine constant)           |

### Severity model (upgrade)

- **critical** — time intervals directly overlap (unchanged).
- **warning** — no overlap, but `gap < travel_time + buffer` (new).
- **ok** — enough gap to walk between venues (new).

### Notes / scope

- ~30 lines of pure math; no new tables.
- Online events (`medium = online`) have no coordinates → skip travel check,
  fall back to pure interval overlap.
- Missing coordinates → degrade gracefully to current behavior.

---

## 2. Capacity + waitlist (priority queue)

### Problem

`events.max_participants` exists but is never enforced. RSVPs are accepted
without bound.

### Approach

When approved RSVP count reaches `max_participants`, new RSVPs enter a
**waitlist** instead of being confirmed. When a confirmed attendee cancels
(or is rejected), auto-promote the highest-priority waitlisted RSVP.

Priority is a sorted queue keyed by:

```
priority_score = f(rsvp_timestamp, role_weight, past_attendance)
```

Default is simple FIFO on `rsvp_timestamp`; role/history are optional boosts.

### Parameters

| Parameter        | Source                                        |
| ---------------- | --------------------------------------------- |
| Capacity         | `events.max_participants`                     |
| Queue order      | `rsvps.created_at` (FIFO base)                |
| Role weight      | `event_members.role` (optional boost)         |
| Attendance score | historical `attendance` rate (optional boost) |
| No-show penalty  | past missed check-ins (optional)              |

### Notes / scope

- Needs a `waitlisted` state on `rsvps` (or reuse the pending/approved flags).
- Promotion triggers a notification to the promoted user.

---

## 3. Group certificate eligibility by threshold

### Problem

Certificates are currently issued per-event on `attendance.checked_in = true`.
For a multi-day **event group**, there is no notion of earning a single
group-level certificate for sufficient participation.

### Approach

A student earns a group certificate only if they attended at least a
configurable percentage of the group's sub-events. Aggregation already exists
in `groupAttendanceSummary`; add a threshold gate.

```
attendance_rate = attendedCount / totalSubEvents
eligible if:  attendance_rate >= minThreshold
```

### Parameters

| Parameter      | Source                                             |
| -------------- | -------------------------------------------------- |
| Sub-events     | `events` where `group_id = :id`                    |
| Attended count | `attendance.checked_in` per student across group   |
| minThreshold   | e.g. 0.75 (tunable per group)                      |

### Notes / scope

- Extends the existing certificate feature and `groupAttendanceSummary` logic.
- `minThreshold` stored on `event_groups` (new column) or passed at issue time.

---

## Deferred (higher complexity)

**Automatic sub-event scheduling / timetabling.** Assign every sub-event a
(day, time-slot, venue) minimizing conflicts. Modeled as **graph coloring**
(nodes = sub-events, edges = can't-share-a-slot, colors = time slots) via
DSATUR/Welsh–Powell, then **simulated annealing** on a weighted penalty
function (attendee overlap, capacity overflow, travel-time violations,
schedule spread). NP-hard; reuses conflict detection (#1) as one constraint.
Recorded as the ambitious option if a flagship algorithm is wanted later.
