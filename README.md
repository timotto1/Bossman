# Bossman — Pluto Olympus

Internal dashboard for housing associations to manage residents, units, transactions,
and platform users. Built on Next.js 14 (App Router) with Supabase as the backend.

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router, `"use client"` components) |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| Styling | Tailwind CSS |
| Charts | Recharts |
| Icons | Heroicons |

---

## Getting started

```bash
npm install
npm run dev
```

Create a `.env.local` in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY=...
```

To set up the database from scratch, run `dev-schema.sql` in the Supabase SQL Editor.

---

## Access control

Access to this dashboard is gated by a `bossman_access: "Yes"` flag in Supabase user
metadata. Every API route in `/src/app/api/internal/olympus/route.ts` checks this
before returning data. Users without the flag receive a `403`.

---

## Database schema overview

All tables live in the `public` schema. The full definition is in `dev-schema.sql`.

### Core tables

| Table | Description |
|---|---|
| `company` | Housing associations (tenants). Every resident, unit, and transaction is scoped to a company. |
| `resident` | Individual residents signed up through the platform. Holds personal, financial, and unit data. |
| `company_development` | A housing development (estate / scheme) belonging to a company. |
| `company_development_units` | Individual units within a development provided by the housing association (CDU). |
| `unit_valuation` | Current market valuation for a CDU unit. One row per unit. |
| `client_transaction` | A staircasing or resale transaction linked to a resident. |
| `resident_documents` | Documents uploaded by or for a resident (stored in Supabase Storage). |
| `resident_notes` | Staff notes on a resident, with threading, pinning, and emoji reactions. |
| `resident_note_reactions` | Per-user emoji reactions on notes. |
| `resident_activity` | Chronological event log of resident actions in the resident-facing app. See `docs/resident-activity.md`. |
| `platform_activity` | Event log of staff actions inside the Bossman dashboard. |
| `profiles` | Maps `auth.users` to a `company_id`. Created automatically on sign-up via trigger. |
| `case_managers` | Legacy table of named case managers linked to companies. |
| `roles` / `permissions` / `role_permissions` / `user_roles` | RBAC tables for platform users. |
| `verification_tokens` | Short-lived tokens used in email verification flows. |
| `password_history` | Hashed previous passwords to prevent reuse. |

### CDU vs UAU units

Units in the system come from two sources:

- **CDU (Company-added unit)** — the housing association has uploaded unit data to
  `company_development_units`. A resident then claims one of these units during sign-up
  by matching on postcode/address. Identified by `resident.company_development_unit_id`
  pointing to a row in `company_development_units` within the same company's portfolio.

- **UAU (User-added unit)** — the resident typed in their address during sign-up but
  it didn't match any known CDU. Their unit data lives directly on the `resident` row.
  `resident.company_development_unit_id` is either `NULL` or points to a unit outside
  this company's portfolio.

Both types are surfaced together in the Units page. CDUs can have the full set of unit
fields edited; UAUs expose a smaller editable subset (the fields that exist on the
`resident` table).

---

## Audit / logging tables

### `unit_change_log`

Records every field-level edit made to a unit through the Bossman dashboard.

```
unit_key        TEXT        -- "cdu-{id}" or "uau-{residentId}"
company_id      BIGINT
changed_by      UUID        -- auth user
changed_by_name TEXT        -- name at time of change (denormalised)
changes         JSONB       -- { fieldName: { from, to } }
created_at      TIMESTAMPTZ
```

Only fields that actually changed are stored. If a user opens edit mode and saves
without modifying anything, no row is written. See `docs/unit-change-log.md` for the
full integration guide.

---

## API

All dashboard data flows through a single unified route:

```
/api/internal/olympus
```

Supported `resource` values:

| resource | Method | Description |
|---|---|---|
| `residents` | GET | All residents for the caller's company |
| `resident_detail` | GET | Single resident with full financial + unit data |
| `resident_activity` | GET | Activity feed for a specific resident |
| `resident_notes` | GET | Threaded notes for a resident |
| `resident_note` | POST / DELETE | Create or delete a note |
| `resident_note_reaction` | POST | Add/change/remove an emoji reaction |
| `resident_note_pin` | POST | Toggle pin on a note |
| `resident_documents` | POST | Upload a document record |
| `transactions` | GET | Client transactions with resident info + documents |
| `units` | GET | All CDU + UAU units for the company |
| `unit` | PATCH | Edit a CDU unit (logs to `unit_change_log`) |
| `uau_unit` | PATCH | Edit a UAU unit's resident data (logs to `unit_change_log`) |
| `unit_change_log` | GET | Audit history for a unit by `unitKey` |
| `developments` | GET | All developments with unit counts + occupancy |
| `platform_users` | GET | All auth users (admin only) |
| `platform_activity` | GET | Activity feed for a platform user |
| `case_managers` | GET | Case managers for a company |
| `roles` | GET | Available RBAC roles |
| `platform_invite_user` | POST | Generate a magic-link invite for a new user |

---

## Documentation

| File | Contents |
|---|---|
| `docs/resident-activity.md` | How to instrument and read the resident activity feed |
| `docs/unit-change-log.md` | Unit edit audit log — schema, diff logic, API, and frontend integration |
