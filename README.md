# FleetOps — Fleet Management Dashboard

## Project Overview
FleetOps is a fleet-operations prototype with a public React landing page and a Supabase-authenticated operations console. The console manages a 16-vehicle sample fleet and covers dashboard KPIs, vehicle status, interactive maps, trip history and routes, alerts and profile settings.

The app uses React, TypeScript, Vite, Tailwind CSS, Supabase Auth/PostgreSQL, MapLibre GL JS and Recharts. All console data comes from Supabase PostgreSQL; there is no client-side demo dataset or mock fallback.

### Main product decisions

- The landing page at `/` is public static React content and does not need a database.
- Every console route requires a Supabase Auth session.
- Fleet KPIs are computed from persisted rows rather than hardcoded counts.
- Alert acknowledgement is a real Postgres write through an RLS-safe RPC.
- Route, trip and map views use persisted location history; sample data is labelled historical rather than live telemetry.
- Deep links preserve selection state, for example `/fleet?vehicle=…`, `/tracking?vehicle=…&trip=…` and `/trips/:tripId`.

### Intended operations-user workflow

1. Sign in and land on the dashboard.
2. Scan fleet KPIs, the map and the attention list.
3. Select a vehicle marker to inspect its last recorded position and health.
4. Triage alerts and acknowledge issues that have been handled.
5. Open Tracking or Trips to review historical movement, routes and driving metrics.

## Live Demo
- **Local preview:** `http://localhost:5173/` after following Local Setup.
- **Demo login credentials:** no credentials are bundled in source control. Create a demo user in your own Supabase project under **Authentication → Users → Add user**, then use that email and password on `/login`.
- For a quick demo, disable email confirmation under **Authentication → Providers → Email**, or confirm the created user before signing in.

## Local Setup

### Install dependencies

```bash
npm install
```

### Configure environment variables

```bash
cp .env.example .env.local
```

Fill `.env.local` with:

| Variable | Required | Notes |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Yes | Project URL from Supabase Dashboard → Project Settings → API. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | `sb_publishable_…` key. The legacy name `VITE_SUPABASE_ANON_KEY` is also accepted. Never use `service_role`. |
| `VITE_MAP_STYLE_URL` | No | Defaults to `https://tiles.openfreemap.org/styles/liberty`. |

Example shape, without real values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
VITE_MAP_STYLE_URL=https://tiles.openfreemap.org/styles/liberty
```

`.env.local` is git-ignored. Missing or invalid Supabase variables show a configuration screen for console routes; the landing page still renders.

### Run the project locally

```bash
npm run dev
```

Open:

- Landing page: `http://localhost:5173/`
- Login: `http://localhost:5173/login`
- Console: `http://localhost:5173/dashboard`

Other commands:

```bash
npm run lint
npm run typecheck
npm run build
npm run preview
```

## Supabase Setup

This project already includes the required SQL files. Apply them in order in the Supabase SQL Editor, or use the Supabase CLI equivalent.

Project SQL Editor: `https://supabase.com/dashboard/project/wwghypagmkshtzsfgtda/sql/new`

### 1. Create the schema

Open and run:

```text
supabase/migrations/0001_initial_schema.sql
```

This file is safe to re-run. It creates extensions, enums, tables, indexes, updated-at triggers, RLS policies, views and RPCs.

### 2. Load sample data

After the migration succeeds, open and run:

```text
supabase/seeds/001_sample_fleet.sql
```

The seed is safe to re-run; it clears and reloads only operational sample data. It does not modify Auth users.

Seed inventory:

- 12 drivers
- 16 vehicles
- 32 trips over roughly 19 days
- 464 location rows: 14 points per trip plus one latest point per vehicle
- 49 events including trip lifecycle, overspeed, low fuel, low battery, offline, ignition and idle cases

Verify with:

```sql
select
  (select count(*) from drivers) as drivers,
  (select count(*) from vehicles) as vehicles,
  (select count(*) from trips) as trips,
  (select count(*) from vehicle_locations) as locations,
  (select count(*) from vehicle_events) as events;
```

Expected: `12 | 16 | 32 | 464 | 49`.

### 3. Main tables

| Table | Purpose |
| --- | --- |
| `profiles` | Application user profile linked to `auth.users`. |
| `drivers` | Driver identity, contact details, licence and status. |
| `vehicles` | Current vehicle state: status, driver, fuel, battery, ignition and last seen time. |
| `trips` | Historical and in-progress trips with route endpoints, timing and driving metrics. |
| `vehicle_locations` | Timestamped GPS points with speed and ignition state. |
| `vehicle_events` | Operational alerts and lifecycle events with severity and acknowledgement state. |

Read-only views:

- `vehicle_latest_location`
- `fleet_status_summary`

RPCs:

- `handle_new_user()` — creates a profile after Auth signup.
- `update_my_profile(p_full_name text)` — narrow profile update.
- `acknowledge_event(p_event_id uuid)` — records the acting user and acknowledgement time.

### 4. Important relationships

- `profiles.id` references `auth.users.id`.
- `vehicles.driver_id` references `drivers.id`.
- `trips.vehicle_id` references `vehicles.id`.
- `vehicle_locations.vehicle_id` references `vehicles.id`.
- `vehicle_locations.trip_id` references `trips.id` when a point belongs to a trip.
- `vehicle_events.vehicle_id` references `vehicles.id`.
- `vehicle_events.trip_id` references `trips.id` for trip lifecycle events.
- `vehicle_events.acknowledged_by` references `profiles.id`.

### 5. Authentication 

username: fleetmgmt@gmail.com
password: Fleet123@


### Data-model decisions

- Six normalized tables model users, drivers, vehicles, trips, locations and events.
- Stable enums represent status, role, event type and severity.
- Current vehicle state belongs on `vehicles`; movement history belongs in `vehicle_locations`.
- Derived dashboard summaries are computed from views and persisted rows, not frontend constants.
- Acknowledgement writes use a security-definer RPC so the browser never needs broad update permissions.

### Map-library choice

MapLibre GL JS is used with the OpenFreeMap `liberty` style. It is open source, works without an API key and supports GeoJSON routes, markers and fit-to-bounds. The map requires WebGL in the browser.

### Important tradeoffs

- The dataset is historical sample data, not a live telemetry feed.
- A single snapshot fetch keeps the frontend simple; very large fleets would need pagination or server-side aggregation.
- Anon/public read access is blocked by RLS, so REST checks without a session correctly return zero rows.
- The map library makes one bundle chunk large; the build is still successful.
- Deployment and live browser QA require credentials that were not provided for this submission.

### AI tools used

Chatgpt 

### Where they were used

- Project scaffolding and component structure.
- Debugging build, typing and seed issues, including an enum cast error in the seed.
- Documentation and setup instructions.

## Optional Walkthrough

No walkthrough video was recorded for this submission.
