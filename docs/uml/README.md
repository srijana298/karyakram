# Mahotsav — UML Diagrams (PlantUML)

These `.puml` files model **the system as actually implemented** (React + Vite
frontend, Express + Drizzle/MySQL backend, JWT auth, Resend email,
`canvas` certificate generation). They deliberately reflect the live boolean
RSVP model (`approved` / `rejected` / `pending`) and `admission_mode`
(`capacity` | `waitlist`) rather than the not-yet-built payment/`status`-enum
flow described in `PRD.md` §10, so every diagram is defensible against the code.

## Files

| # | File | Diagram |
|---|------|---------|
| Dynamic | `04-state-rsvp-analysis.puml` | State machine (analysis) |
| | `05-state-rsvp-refined.puml` | State machine (refined) |
| | `06-sequence-rsvp-analysis.puml` | Sequence — RSVP (analysis) |
| | `07-sequence-rsvp-refined.puml` | Sequence — RSVP (refined) |
| | `08-sequence-auth.puml` | Sequence — signup/login |
| | `09-sequence-checkin.puml` | Sequence — self check-in |
| Process | `10-activity-rsvp.puml` | Activity — RSVP request |
| | `11-activity-checkin.puml` | Activity — attendance check-in |
| | `12-activity-organizer-review.puml` | Activity — organizer approve/reject |
| Structure | `01-class-analysis.puml` | Class (analysis / domain) |
| | `02-class-refined.puml` | Class (refined / design) |
| | `03-object.puml` | Object diagram (snapshot) |
| System | `13-system-design.puml` | High-level architecture |
| | `14-component.puml` | Component diagram |
| | `15-deployment.puml` | Deployment diagram |

## Rendering

- **VS Code:** install the *PlantUML* extension, open a `.puml`, `Alt+D` to preview.
- **CLI:** `plantuml docs/uml/*.puml` (needs Java + Graphviz) → produces PNG/SVG.
- **Online:** paste into <https://www.plantuml.com/plantuml>.
