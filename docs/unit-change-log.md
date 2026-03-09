# Unit Change Log — Database & Integration Guide

Every time a staff member edits a unit through the Bossman dashboard, the change is
persisted to `unit_change_log`. This document covers the table design, what gets
recorded, and how the data flows from the edit form through to the audit timeline shown
in the unit slide-over.

---

## 1. Why this table exists

Property records are high-stakes. A purchase price entered incorrectly or a status
flipped accidentally can affect resident-facing calculations, compliance reports, and
housing-association reconciliation. Having an immutable log of every field-level change
means:

- **Accountability** — every change is tied to a named user and timestamp.
- **Auditability** — housing associations can ask "who changed X and when?" and get a
  precise answer.
- **Recovery** — before-values are stored so a bad edit can be identified and reverted.

---

## 2. Table schema

```sql
CREATE TABLE IF NOT EXISTS public.unit_change_log (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_key        TEXT        NOT NULL,   -- "cdu-{id}" or "uau-{residentId}"
    company_id      BIGINT      REFERENCES public.company(id) ON DELETE SET NULL,
    changed_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_by_name TEXT,                  -- denormalised display name at time of change
    changes         JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unit_change_log_unit_key
    ON public.unit_change_log(unit_key);
```

### Column notes

| Column | Type | Notes |
|---|---|---|
| `unit_key` | `TEXT` | Composite key that identifies the unit across both unit types. Format: `"cdu-{company_development_units.id}"` for company-provided units, `"uau-{resident.id}"` for resident self-selected units. |
| `company_id` | `BIGINT` | The housing association that owns this unit. Used for multi-tenant scoping. Set to `NULL` if the company is later deleted. |
| `changed_by` | `UUID` | The `auth.users.id` of the staff member who made the edit. Set to `NULL` if the user is later deleted. |
| `changed_by_name` | `TEXT` | Display name **at the time of the change** (e.g. `"John Smith"`). Denormalised intentionally — the name should not change retroactively if the user later updates their profile. |
| `changes` | `JSONB` | Field-level diff. See structure below. |
| `created_at` | `TIMESTAMPTZ` | When the change was saved. Immutable after insert. |

---

## 3. The `changes` JSONB structure

Each key in the `changes` object is a database column name that was modified. The value
is a `{ from, to }` pair holding the old and new values.

```json
{
  "status": { "from": "vacant", "to": "occupied" },
  "monthly_rent": { "from": 950, "to": 1100 },
  "purchase_price": { "from": null, "to": 245000 }
}
```

Unchanged fields are **never included** — if only `monthly_rent` changed, the object
will contain exactly one key. A row is only inserted at all if at least one field
differs from its current database value.

### Tracked fields by unit type

**CDU units** (`company_development_units` table):

| Field | Display label |
|---|---|
| `status` | Status |
| `unit_type` | Unit Type |
| `lease_type` | Lease Type |
| `purchase_price` | Purchase Price |
| `purchase_date` | Purchase Date |
| `percentage_sold` | Share Sold |
| `monthly_rent` | Monthly Rent |
| `service_charge` | Service Charge |
| `specified_rent` | Specified Rent |
| `is_verified` | Verified |

**UAU units** (`resident` table — resident's self-reported unit data):

| Field | Display label |
|---|---|
| `unit_type` | Unit Type |
| `purchase_price` | Purchase Price |
| `purchase_date` | Purchase Date |
| `percentage_sold` | Share Sold |
| `monthly_rent` | Monthly Rent |
| `service_charge` | Service Charge |

UAU units have a smaller editable set because `status`, `lease_type`, `specified_rent`,
and `is_verified` do not exist on the `resident` table — they are CDU-only concepts.

---

## 4. How the diff is computed (API logic)

The PATCH handler in `/src/app/api/internal/olympus/route.ts` follows this sequence for
both `resource: "unit"` (CDU) and `resource: "uau_unit"` (UAU):

1. **Authorise** — verify the unit/resident belongs to the caller's company.
2. **Fetch current values** — read the existing row from the database before applying
   any changes.
3. **Build `updateFields`** — parse and type-coerce the incoming payload (empty strings
   → `null`, numeric strings → `Number`, booleans → `Boolean`).
4. **Apply the update** — write `updateFields` to the database.
5. **Compute the diff** using `diffFields()`:
   ```typescript
   function diffFields(current, updated) {
     // Compares string-normalised representations so that
     // 250000 (number) and "250000" (string) are treated as equal.
     // null and "" are both normalised to null.
   }
   ```
6. **Insert a log row** — only if `Object.keys(changes).length > 0`. If nothing
   actually changed (e.g. the user opened edit mode and saved without touching
   anything), no row is written.

---

## 5. Reading the log (API)

```
GET /api/internal/olympus?resource=unit_change_log&unitKey=cdu-42
GET /api/internal/olympus?resource=unit_change_log&unitKey=uau-107
```

Returns up to 50 entries, newest first:

```json
{
  "data": [
    {
      "id": "3f8a1c...",
      "unit_key": "cdu-42",
      "changed_by_name": "Jane Smith",
      "changes": {
        "monthly_rent": { "from": 950, "to": 1100 }
      },
      "created_at": "2026-03-09T14:22:00Z"
    }
  ]
}
```

The endpoint is protected by the standard Bossman access check (`bossman_access: "Yes"`
in user metadata). No additional parameters are required.

---

## 6. Frontend integration

The unit slide-over in `/src/app/dashboard/units/page.tsx` fetches the log automatically
whenever a unit row is clicked:

```typescript
useEffect(() => {
  if (!selected) return;
  fetch(`/api/internal/olympus?resource=unit_change_log&unitKey=${selected.key}`)
    .then(r => r.json())
    .then(j => setChangeLogs(j.data ?? []));
}, [selected?.key]);
```

After a successful save the log is re-fetched so the new entry appears immediately
without requiring a page reload.

The **Change History** section at the bottom of the slide-over renders a vertical
timeline — one entry per log row, showing the formatted date, editor name, and each
changed field with old → new values. Values are formatted to match how they appear
in the rest of the UI (currency for monetary fields, percentage for share fields,
human-readable date for date fields, Yes/No for booleans).

---

## 7. RLS policy

In the development environment the table uses the blanket permissive policy that covers
all tables:

```sql
ALTER TABLE public.unit_change_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY dev_all ON public.unit_change_log USING (true) WITH CHECK (true);
```

For production this should be tightened to:

```sql
-- Bossman users can read logs for units belonging to their company
CREATE POLICY "bossman_read_unit_change_log"
ON public.unit_change_log
FOR SELECT
USING (
  company_id = (
    SELECT (auth.jwt() -> 'user_metadata' ->> 'company')::bigint
  )
);

-- Only the service role (server-side API) can insert
-- No INSERT policy needed — service role bypasses RLS
```

---

## 8. Running the migration

The table is defined in `dev-schema.sql`. To add it to an existing Supabase project,
run the following in the **SQL Editor**:

```sql
CREATE TABLE IF NOT EXISTS public.unit_change_log (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_key        TEXT        NOT NULL,
    company_id      BIGINT      REFERENCES public.company(id) ON DELETE SET NULL,
    changed_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_by_name TEXT,
    changes         JSONB       NOT NULL DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_unit_change_log_unit_key
    ON public.unit_change_log(unit_key);

ALTER TABLE public.unit_change_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dev_all ON public.unit_change_log;
CREATE POLICY dev_all ON public.unit_change_log USING (true) WITH CHECK (true);
```
