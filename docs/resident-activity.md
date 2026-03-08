# Resident Activity Feed — Integration Guide

The Activity tab on each resident's profile page (`/dashboard/residents/[id]`) displays a
chronological feed of everything that resident has done inside the app. Currently it renders
**dummy data** — this document explains exactly what needs to be built to make it live.

---

## 1. Database table

The `resident_activity` table already exists in the schema:

```sql
CREATE TABLE public.resident_activity (
    id               BIGSERIAL   PRIMARY KEY,
    resident_id      BIGINT      NOT NULL REFERENCES public.resident(id) ON DELETE CASCADE,
    event_action     TEXT        NOT NULL,  -- what happened (login, update, complete, view, message)
    section          TEXT        NOT NULL,  -- which part of the app (auth, profile, staircasing_calculator, …)
    sub_section      TEXT,                  -- optional drill-down (financial, personal, overview, …)
    event_timestamp  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    metadata         JSONB                  -- arbitrary key/value context for the event
);

CREATE INDEX ON public.resident_activity (resident_id, event_timestamp DESC);
```

The `metadata` column is a free-form JSONB object. The frontend reads specific keys from it
depending on `section` — see the event taxonomy below.

---

## 2. Event taxonomy

Every event is identified by the combination of `event_action` + `section`.

| event_action | section                   | sub_section        | Description                                | Example metadata                                                   |
|--------------|---------------------------|--------------------|--------------------------------------------|--------------------------------------------------------------------|
| `login`      | `auth`                    | —                  | Resident signed in                         | `{ "browser": "Safari", "device": "Mobile" }`                     |
| `update`     | `profile`                 | `personal`         | Changed name, email, phone, address        | `{ "fields": ["phone_number", "email"] }`                          |
| `update`     | `profile`                 | `financial`        | Changed income, savings, debt              | `{ "fields": ["annual_household_income", "cash_savings"] }`        |
| `complete`   | `staircasing_calculator`  | —                  | Ran the staircasing affordability tool     | `{ "current_share": 25, "target_share": 50, "affordable_share": 40 }` |
| `view`       | `staircasing_application` | `overview`         | Opened the staircasing application section | `{ "page": "overview" }`                                           |
| `start`      | `staircasing_application` | —                  | Started a formal staircasing application   | `{ "application_id": "uuid" }`                                     |
| `message`    | `ai_assistant`            | —                  | Completed an AI chat session               | `{ "topic": "Staircasing eligibility", "message_count": 8 }`       |

Add new rows to this table as you instrument new areas of the resident app.

---

## 3. Writing events from the resident app

Events must be written server-side to bypass RLS. Create a small helper in the resident app:

```typescript
// resident-app/lib/trackActivity.ts

export async function trackActivity(
  supabaseServerClient: SupabaseClient,
  residentId: number,
  event_action: string,
  section: string,
  options?: {
    sub_section?: string;
    metadata?: Record<string, unknown>;
  }
) {
  const { error } = await supabaseServerClient
    .from("resident_activity")
    .insert({
      resident_id: residentId,
      event_action,
      section,
      sub_section: options?.sub_section ?? null,
      metadata: options?.metadata ?? null,
    });

  if (error) console.error("[trackActivity]", error.message);
}
```

### Login event
Fire this in the auth callback / session creation handler in the resident app:

```typescript
// resident-app/app/auth/callback/route.ts (or equivalent)
await trackActivity(supabase, resident.id, "login", "auth", {
  metadata: {
    browser: req.headers.get("user-agent") ?? null,
    device: isMobile(req) ? "Mobile" : "Desktop",
  },
});
```

### Profile / financial data update
Fire this in any server action or API route that saves resident data:

```typescript
// After a successful profile save
await trackActivity(supabase, resident.id, "update", "profile", {
  sub_section: "financial",           // or "personal"
  metadata: { fields: Object.keys(changedFields) },
});
```

### Staircasing calculator completion
Fire this when the resident submits the calculator and receives a result:

```typescript
await trackActivity(supabase, resident.id, "complete", "staircasing_calculator", {
  metadata: {
    current_share: result.currentShare,
    target_share: result.targetShare,
    affordable_share: result.affordableShare,
  },
});
```

### Staircasing application view / start
```typescript
// When the resident navigates to the application section
await trackActivity(supabase, resident.id, "view", "staircasing_application", {
  sub_section: "overview",
  metadata: { page: "overview" },
});

// When they formally start an application
await trackActivity(supabase, resident.id, "start", "staircasing_application", {
  metadata: { application_id: newApplication.id },
});
```

### AI conversation
Fire this at the end of each chat session (not on every message, to avoid noise):

```typescript
await trackActivity(supabase, resident.id, "message", "ai_assistant", {
  metadata: {
    topic: derivedTopic,           // optional — from first message / classification
    message_count: session.length,
  },
});
```

---

## 4. RLS policy

The `resident_activity` table should allow **inserts from service-role only** (the resident app
should write events through a server route, never directly from the browser client):

```sql
-- Allow service role to insert (no policy needed — service role bypasses RLS)
-- Allow the Bossman dashboard to read activity for residents in their company:
CREATE POLICY "bossman_read_resident_activity"
ON public.resident_activity
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.resident r
    WHERE r.id = resident_activity.resident_id
    AND r.company_id = (
      SELECT (auth.jwt() -> 'user_metadata' ->> 'company')::int
    )
  )
);
```

---

## 5. Connecting the frontend to real data

The `fetchActivity` function in `src/app/dashboard/residents/[id]/page.tsx` already calls the
correct API endpoint — it's just commented out. To go live:

1. Confirm `resident_activity` rows are being written by the resident app (check Supabase Table
   Editor).
2. In `page.tsx`, find `fetchActivity` and **uncomment the real fetch block**, then **delete the
   dummy data line** (`setActivity(DUMMY_ACTIVITY)`).

```diff
- await new Promise((r) => setTimeout(r, 300)); // simulate network
- setActivity(DUMMY_ACTIVITY);
+ const res = await fetch(
+   `/api/internal/olympus?resource=resident_activity&residentId=${residentId}`
+ );
+ const json = await res.json();
+ const events: ActivityEvent[] = (json.data ?? []).map((e: any) => ({
+   id: String(e.id),
+   event_action: e.event_action,
+   section: e.section,
+   sub_section: e.sub_section,
+   event_timestamp: e.date + "T" + e.time,
+   metadata: e.metadata,
+ }));
+ setActivity(events);
```

The API route (`/api/internal/olympus?resource=resident_activity`) is already implemented — it
queries `resident_activity` filtered by `resident_id` and returns events ordered newest-first.

---

## 6. Adding new event types to the UI

When you add a new `event_action` / `section` combination, add a matching branch to the
`getEventDisplay()` function in `page.tsx`:

```typescript
if (section === "my_new_section") {
  return {
    Icon: SomeHeroIcon,
    label: "Human-readable event name",
    description: metadata?.some_key ? `Detail: ${metadata.some_key}` : "",
    iconBg: "bg-teal-50 dark:bg-teal-900/30",
    iconColor: "text-teal-600 dark:text-teal-400",
  };
}
```

The fallback branch at the bottom of `getEventDisplay` will catch any unknown events and render
them without crashing, so new events won't break the UI before `getEventDisplay` is updated.
