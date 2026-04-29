---
name: Mahotsav
description: Event management and RSVP platform for individual creators
colors:
  primary: "#2563EB"
  primary-hover: "#1D4ED8"
  accent: "#32C0EF"
  accent-hover: "#2AAED8"
  secondary: "#0D162E"
  on-secondary: "#E5E5E5"
  background: "#F3F4F6"
  surface: "#FFFFFF"
  on-surface: "#000000"
  on-surface-variant: "#525252"
  neutral-100: "#F3F4F6"
  neutral-200: "#E5E7EB"
  neutral-300: "#D4D4D8"
  neutral-400: "#A3A3A3"
  neutral-500: "#737373"
  neutral-600: "#525252"
  error: "#DC2626"
  success: "#22C55E"
  warning: "#F59E0B"
  avatar-gradient-from: "#32C0EF"
  avatar-gradient-to: "#2563EB"
typography:
  display:
    fontFamily: Geist
    fontSize: 60px
    fontWeight: "700"
    lineHeight: 72px
  display-md:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: "700"
    lineHeight: 40px
  headline:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: "700"
    lineHeight: 32px
  title:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: "700"
    lineHeight: 28px
  title-md:
    fontFamily: Geist
    fontSize: 18px
    fontWeight: "600"
    lineHeight: 28px
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: "400"
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "400"
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: "400"
    lineHeight: 18px
  label:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: "500"
    lineHeight: 16px
  label-caps:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: "600"
    lineHeight: 20px
    letterSpacing: 0.05em
  stat-number:
    fontFamily: Geist
    fontSize: 72px
    fontWeight: "700"
    lineHeight: 72px
rounded:
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 18px
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  container-padding-sm: 24px
  container-padding-md: 48px
  container-padding-lg: 96px
  container-max-width: 1280px
  section-gap: 32px
  card-padding: 16px
  card-gap: 16px
motion:
  duration-fast: 100ms
  duration-normal: 150ms
  duration-medium: 300ms
  duration-slow: 500ms
  duration-slower: 700ms
  easing-default: "ease-in-out"
  easing-spring: "cubic-bezier(0.34, 1.56, 0.64, 1)"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-full:
    backgroundColor: "#000000"
    textColor: "#FFFFFF"
    typography: "{typography.body-lg}"
    rounded: "{rounded.xl}"
    padding: 16px
  button-full-disabled:
    backgroundColor: "#000000"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
  button-cta:
    backgroundColor: "{colors.accent}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px
  button-cta-secondary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: 16px
  input-field:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "8px 4px"
    typography: "{typography.body-md}"
  input-field-focus:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
  input-label:
    textColor: "{colors.neutral-500}"
    typography: "{typography.body-sm}"
  sidebar-link:
    textColor: "{colors.neutral-600}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "8px 16px"
  sidebar-link-hover:
    backgroundColor: "{colors.neutral-200}"
    textColor: "#111827"
  event-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-padding}"
  event-card-hover:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
  notification-card:
    backgroundColor: "{colors.neutral-100}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
    padding: "{spacing.card-padding}"
  avatar:
    backgroundColor: "{colors.accent}"
    rounded: "{rounded.full}"
    textColor: "#FFFFFF"
    typography: "{typography.label}"
  search-bar:
    backgroundColor: "{colors.neutral-200}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
  ticket:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.xl}"
  ticket-primary-section:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
  ticket-secondary-section:
    backgroundColor: "{colors.secondary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.xl}"
  page-title:
    typography: "{typography.headline}"
    textColor: "{colors.on-surface}"
  dashboard-stat:
    typography: "{typography.stat-number}"
    textColor: "{colors.on-surface}"
---

## Overview

Mahotsav is a creator-first event management and RSVP platform built for
individual artists, organizers, and contributors. The visual identity is
**bold and functional** — a high-contrast palette of bold blue primary,
electric blue accent, and deep navy dark surfaces. The design feels
energetic yet professional, like a modern event poster system.

The UI is split into two distinct zones:

- **Public-facing pages** (Landing, Explore, Event Detail) use the deep
  navy (`secondary`) as a hero background with white and pink typography
  on top, then transition to clean white surfaces for content areas.
- **Dashboard** is a tool-focused light UI — white card surfaces on a
  light gray (`neutral-100`) background, with the sidebar providing
  persistent navigation.

The overall aesthetic sits between a SaaS dashboard and an event ticketing
app. Every interactive element uses the shared 18px pill radius (rounded-xl)
or fully rounded buttons, giving the UI a friendly, approachable feel.

## Colors

The palette is built around three strong personality colors:

- **Primary (#2563EB):** Bold blue — the action color. Used for CTAs, active
  states, brand emphasis, and the primary button. This blue conveys trust
  and professionalism while remaining energetic enough for a campus platform.
- **Accent (#32C0EF):** Electric sky blue — the secondary action and
  informational highlight color. Used for links, active navigation states,
  secondary CTA buttons, and the explore/RSVP flow.
- **Secondary (#0D162E):** Deep navy — the dark surface. Used for the
  landing hero section, navbar, footer, ticket dark sections, and any
  area that needs dramatic contrast. Text on this surface is light gray
  (`neutral-200` range).

The neutral scale runs from pure white through Tailwind's gray palette
(`gray-100` to `gray-700`). White (`surface`) is the dominant card and
content background. `neutral-100` (`gray-100`) is the page-level
background that cards sit on top of.

### Gradient usage

- Avatar initials use a diagonal gradient from accent to primary
  (`from-accent to-primary`).
- CTA buttons on the landing page use subtle vertical or horizontal
  gradients (e.g., `from-accent to-accent/90`).
- Owner/collaborator/volunteer role badges use distinct gradients:
  yellow-gold for owner, primary-pink for collaborator, accent-blue for
  volunteer.

## Typography

**Geist** is the primary and sole typeface — a clean geometric sans-serif
with excellent readability at all sizes. It is used across every surface,
from the landing hero to dashboard labels.

The type scale is straightforward:

- **Display (60px/700):** Hero headlines on the landing page. Multi-line
  with generous line height.
- **Headline (24px/700):** Page titles in the dashboard, section headers
  on explore pages.
- **Title (20px/700) / Title-md (18px/600):** Card titles, event names,
  section sub-headers.
- **Body (14px/400):** Paragraph text, descriptions, form content.
- **Label (14px/600):** Buttons, sidebar links, interactive labels.
- **Stat-number (72px/700):** Dashboard metric counters — oversized bold
  numbers for total/public/private/offline/online event counts.

Text color follows surface context: dark text on white/gray surfaces,
light text on the navy hero background. The hero subtitle uses muted
slate tones (`text-slate-400`) for hierarchy.

## Layout & Spacing

### Container

Content is constrained to a max width of 1280px (`max-w-7xl`) with
horizontally centered auto margins. Horizontal padding scales responsively:
- Mobile: 24px (`px-6`)
- Tablet: 48px (`sm:px-12`)
- Desktop small: 80px (`md:px-20`)
- Desktop large: 96px (`lg:px-24`)

### Grid

- Dashboard event grid: 2 columns on large screens (`lg:grid-cols-2`)
- Event detail page: 6-column grid, content takes 4 cols, sidebar takes 2
  (`md:grid-cols-6`)
- Dashboard event detail: 5-column grid with collapsible user panel

### Spacing scale

Spacing follows a 4px base unit. Common gaps:
- Form fields: 16px (`gap-4`)
- Card grids: 16px (`gap-4`)
- Section padding: 32px vertical (`py-8`)
- Page-level sections: 48–64px (`py-12` to `py-16`)

### Sidebar

The dashboard sidebar is a fixed left panel with a right border
(`border-r border-neutral-200`), 16px inner padding, and navigation links
stacked vertically. The brand logo sits at the top, user account and
logout at the bottom (`mt-auto`).

## Elevation & Depth

Shadows are minimal and utilitarian:

- **Default cards:** Near-invisible shadow (`shadow-sm`) with a 1px
  neutral outline (`outline outline-1 outline-neutral-100`). The outline
  does more visual work than the shadow.
- **Hover state:** Elevated shadow (`shadow-lg`) on event cards and
  feature cards — the primary depth signal for interactive elements.
- **Accent glow:** Some feature cards use a tinted shadow
  (`shadow-accent/20`) for brand personality.
- **Modals and toasts:** Medium shadow (`shadow-lg`) for floating layers.
- **Landing hero:** Text uses `drop-shadow-2xl` for legibility over the
  dark background.

Outline borders (1px `neutral-100` or `neutral-300`) are used more
prominently than shadows as the primary card boundary signal. This keeps
the UI feeling flat and modern rather than skeuomorphic.

## Shapes

The 18px border radius (`rounded-[18px]`) is the defining shape token
of this design system. It appears on:

- Event cards
- Input fields
- Buttons (in combination with `rounded-full` for CTAs)
- Notification cards
- Search bars
- Image upload previews
- Toast notifications
- Modal dialogs
- The ticket component

Smaller radii are used contextually:
- Sidebar links and secondary buttons: 6px (`rounded-md`)
- Explore event date badges: 8px (`rounded`)
- Avatars and CTA buttons: fully round (`rounded-full`)
- Swiper pagination bullets: circular with an outline offset ring

The consistent use of the oversized 18px radius gives Mahotsav its
signature soft, friendly card aesthetic — every container feels like a
rounded tile.

## Components

### Event Card

The workhorse component. White background, 18px radius, 1px neutral
outline, subtle shadow. Contains a cover image (16:9, also 18px radius)
with overlaid category badge (top-left, white bg) and medium indicator
(bottom-right, white bg with location/computer icon). Below the image,
a flex row splits into title+description (left) and time/date (right)
with a thin horizontal divider. Hover elevates to `shadow-lg`.

### Input Field

Bordered container with 18px radius, transparent background. Focus state
darkens the border. Supports left and right icon slots. Labels sit above
in small neutral text. Textarea variant uses the same container style.
An options/chips variant renders toggle buttons using `primary-btn` and
`sidebar-link` classes.

### Primary Button

Small pink (`primary`) button used throughout the dashboard. 6px radius,
compact padding (8px 16px), white text. Used for action links in the
sidebar, event actions, and inline controls.

### Full-Width Button (Auth)

Black background, 18px radius, full width, 16px vertical padding. Used
exclusively in auth forms (Sign in, Sign up, Verify OTP). Disabled state
at 50% opacity. Shows "Processing..." text when loading.

### CTA Buttons (Landing)

Pill-shaped (`rounded-full`) with gradient backgrounds and large shadow.
The primary CTA uses the accent gradient; the secondary uses the primary
gradient. Generous 16px padding. These feel like campaign buttons.

### Sidebar Navigation

Vertical link list with 6px radius, 14px font weight 600. Default state
is neutral gray text. Hover shows gray background with shadow. Active
route is indicated by accent color text. Icons precede each label.
The notification badge is a small pink circle with white count text.

### Notification Card

Rounded tile on a gray background channel. White bg would work but the
current `slate-100` with 1px outline and shadow creates subtle depth
within the notification panel. Contains avatar, sender name, message,
and relative timestamp.

### Ticket Component

A fixed-width (1024px) horizontal composition of three sections:
1. **Left bar:** Primary pink background with decorative barcode image
2. **Center:** Event image as background with event details overlay at
   the bottom using accent background
3. **Right panel:** Secondary navy background with QR code, dashed
   outline, and "ADMIT ONE" text

The ticket uses dashed borders between sections as a perforation metaphor.

### Search Bar

Gray-200 background with matching border, 18px radius. Contains a text
input and a dropdown selector separated by a left border. Used in the
events list and user list panels.

### Avatar

Circular container with gradient background (accent to primary). Displays
the first character of the user's name in white bold text. Size varies
by context — default is compact, account page uses a larger version.

### Dashboard Stats

Full-width row of stat blocks separated by left borders. Each block shows
an oversized bold number (72px weight 700) with a small label below
("Total Events Added", "Public Events Added", etc.). A hidden "See all"
link slides in on hover.

## Do's and Don'ts

### Do

- Use the 18px radius (`rounded-[18px]`) for all card-like containers,
  inputs, modals, and buttons that aren't pill-shaped.
- Use `primary` (#2563EB) for the main action in any context — the
  primary button, active indicators, brand emphasis.
- Use `accent` (#32C0EF) for secondary actions, active navigation states,
  and informational highlights.
- Pair the deep navy `secondary` background with light/white text only.
- Use 1px outline borders in `neutral-100` or `neutral-300` as the
  primary card boundary, with shadow as a secondary depth cue.
- Scale buttons to 0.95 on `:active` for tactile feedback.
- Use the gradient avatar for user initials — never a plain colored circle.
- Maintain consistent 16px gaps in form layouts.

### Don't

- Don't mix the 18px radius with sharp corners in the same context —
  pick one radius language per surface.
- Don't use `primary` and `accent` together as competing colors on the
  same element. One must dominate; the other supports.
- Don't place dark text on the navy `secondary` background — contrast
  will fail.
- Don't use heavy shadows by default. Reserve `shadow-lg` for hover
  states and modals only.
- Don't introduce new typefaces — Geist handles all typographic roles.
- Don't use `neutral-500` or lighter grays for body text on white
  backgrounds — they fail accessibility at small sizes.
