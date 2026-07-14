# Test Cases

## Nepal Demo Seed Data

Run the current realistic Nepal seed:

```bash
cd server
npm run db:seed:nepal
```

This wipes existing demo data and creates:

- 50 Nepal-based users
- 13 categories
- 10 featured calendars around Nepal
- 130 realistic Nepal events, 10 per category
- Relevant seed images per category
- Light RSVP data: each attendee has only 1–2 RSVPs total
- A deterministic RSVP conflict fixture

Example output:

```txt
👥 Users: 50
🏷️  Categories: 13
📆 Featured calendars: 10
🎪 Events: 130 (13 categories × 10)
📨 RSVPs: ~50
🧪 Conflict fixture: sita-basnet11@mahotsav.com is going to /pwrt1u8o; try RSVP on overlapping /bf9x7i47
```

> Short codes change every time you reseed. Always use the exact two short codes printed in your terminal.

---

## Test Accounts

All seeded users use:

```txt
password123
```

Useful accounts:

```txt
Admin:     admin@mahotsav.com
Organizer: aarya-tamang1@mahotsav.com
Attendee:  sita-basnet11@mahotsav.com
```

---

## RSVP Conflict Detection

The app should prevent a user from RSVPing to an event that overlaps with another event they are already approved for or pending on.

Conflict rule:

```txt
existing.start < target.end AND target.start < existing.end
```

Rejected RSVPs should not block future RSVPs.

---

## Manual Browser Test

### 1. Login

Go to:

```txt
http://localhost:5174/auth/login
```

Login with:

```txt
sita-basnet11@mahotsav.com / password123
```

---

### 2. Open the existing RSVP event

From seed output, open the first conflict URL:

```txt
http://localhost:5174/FIRST_CODE
```

Example:

```txt
http://localhost:5174/pwrt1u8o
```

Expected:

- This is the event the user already has an RSVP for.
- The user should already be going/pending for this event depending on UI state.

---

### 3. Try RSVP on overlapping event

From seed output, open the second conflict URL:

```txt
http://localhost:5174/SECOND_CODE
```

Example:

```txt
http://localhost:5174/bf9x7i47
```

Click:

```txt
RSVP — It's Free
```

Expected:

- RSVP should be blocked.
- A toast/API error should say the event overlaps with the existing event.
- No new RSVP should be created.

Example error:

```txt
This event overlaps with Kutumba Tribute Evening — Kathmandu on Jul 16, 9:15 PM
```

---

## API Test

### 1. Login and get token

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"sita-basnet11@mahotsav.com","password":"password123"}'
```

Copy the returned token.

---

### 2. Resolve the overlapping short code

Replace `SECOND_CODE` with the second code from your seed output:

```bash
curl http://localhost:8000/api/events/code/SECOND_CODE
```

Copy the returned event `id`.

---

### 3. Try to RSVP

```bash
curl -X POST http://localhost:8000/api/rsvps/EVENT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

Expected response:

```json
{
  "success": false,
  "message": "This event overlaps with ..."
}
```

HTTP status should be:

```txt
409 Conflict
```

---

## Non-conflicting RSVP Sanity Test

Use a different attendee account or a different event that does not overlap with the user’s existing 1–2 RSVPs.

Steps:

1. Login as another attendee.
2. Open a random event from Explore.
3. Click `RSVP — It's Free`.

Expected:

- RSVP succeeds if registration is open.
- If the event requires approval, RSVP becomes pending.
- If the event auto-approves, user becomes going.

---

## Seed Data Quality Checks

After seeding, verify:

### Users

Expected:

```txt
50 users total
1 admin
10 organizers
39 attendees
```

### Events

Expected:

```txt
130 events total
10 events per category
All events are Nepal-based
Public event URLs use random short codes
```

### Calendars

Expected:

```txt
10 featured calendars
Calendars are based around Nepal cities like Kathmandu, Pokhara, Lalitpur, Bhaktapur, Chitwan, Biratnagar, Butwal, Dharan, Nepalgunj, Janakpur
```

### RSVPs

Expected:

```txt
Each attendee has only 1–2 RSVPs total
The conflict fixture attendee has exactly one seeded RSVP before testing the overlapping event
```

---

## Edge Cases To Verify Later

- Event with missing `end_date` should use same-time fallback.
- Pending RSVPs should block conflicting RSVP attempts.
- Rejected RSVPs should not block future RSVPs.
- Organizer should still be blocked from RSVPing to their own event.
- Invitation accept should eventually use the same conflict detection rule.
- Back-to-back events should be allowed when one event ends exactly when another starts.
