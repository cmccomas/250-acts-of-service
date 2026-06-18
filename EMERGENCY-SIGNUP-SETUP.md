# Upriver Fire Relief Signup: Setup Guide

This adds a resource signup form for the Mount Spokane Stake to the existing
site, backed by a free Supabase (Postgres) database.

- Public form: `/emergency-signup`
- Leader admin: `/emergency-signup/admin` (password protected)
- Admin API: `/api/submissions` (server-side, holds the service role key)

The public can submit offers but can never read anyone's submission. Only the
password-protected admin page and you (through the Supabase dashboard) can see
the data.

---

## 1. Create the Supabase project

1. Go to https://supabase.com and sign in (GitHub login is easiest).
2. Click **New project**. Pick your organization, name it (for example
   `mount-spokane-relief`), set a database password (save it somewhere safe),
   choose the region closest to Spokane (`West US` / Oregon), and keep the
   **Free** plan.
3. Wait about a minute for it to finish provisioning.

## 2. Create the table and security rules

1. In the project, open **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this repo, copy the whole file, paste it in,
   and click **Run**.
4. You should see "Success. No rows returned." This creates the
   `resource_offers` table, enables Row Level Security, and adds the single
   policy that lets the public submit (insert) but never read.

### Why the public cannot read submissions

The script enables Row Level Security on the table and creates exactly one
policy: the anonymous (public) key may `INSERT` only. There is deliberately no
`SELECT`, `UPDATE`, or `DELETE` policy, and with RLS enabled the absence of a
policy means denied. So a visitor on the public form can add their own offer
but cannot read back anyone's data, including their own. Reads happen only two
ways: in the Supabase dashboard where you are logged in, and through the admin
API route using the service role key (which bypasses RLS and stays on the
server).

## 3. Find your keys

In the Supabase project, go to **Project Settings** (gear icon) > **API**.
You need three values:

| Value | Where on the page | Used for |
| --- | --- | --- |
| **Project URL** | "Project URL" | both the public form and the admin route |
| **anon public key** | "Project API keys" > `anon` `public` | the public form (safe to expose) |
| **service_role key** | "Project API keys" > `service_role` (click reveal) | the admin route only. Keep secret. |

The service role key bypasses all security rules. Never put it in client code
or commit it. It goes only in a Vercel environment variable.

## 4. Set the Vercel environment variables

In the Vercel dashboard, open the `250-acts-of-service` project >
**Settings** > **Environment Variables**. Add these for the
**Production** (and Preview, if you use it) environment:

| Name | Value | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | your Project URL | public, read by the form in the browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon public key | public, read by the form in the browser |
| `SUPABASE_SERVICE_ROLE_KEY` | your service_role key | secret, server only |
| `ADMIN_PASSWORD` | a strong shared password for leaders | already used by the existing admin panel; the relief admin shares it |

Notes:

- `NEXT_PUBLIC_*` values are baked into the site at build time, so the project
  must be redeployed after you set or change them (step 6 does this).
- `ADMIN_PASSWORD` likely already exists in this project (the existing admin
  uses it). The relief admin page reuses the same variable, so the same
  password works for both. If you want a different password just for relief,
  tell me and I will switch the route to its own variable.
- You do not need a separate `SUPABASE_URL`; the admin route falls back to
  `NEXT_PUBLIC_SUPABASE_URL`.

## 5. Add the GitHub secret for the keep-alive

The keep-alive workflow (`.github/workflows/supabase-keepalive.yml`) pings the
database twice a week so the free project never pauses. It needs two repo
secrets. Add them either in the GitHub UI or with the CLI.

GitHub UI: repo > **Settings** > **Secrets and variables** > **Actions** >
**New repository secret**. Add:

- `SUPABASE_URL` = your Project URL
- `SUPABASE_ANON_KEY` = your anon public key

Or with the GitHub CLI (run in the repo):

```bash
gh secret set SUPABASE_URL --body "https://YOUR-PROJECT-ref.supabase.co"
gh secret set SUPABASE_ANON_KEY --body "your-anon-public-key"
```

You can trigger a test run from the repo **Actions** tab > **Supabase
keep-alive** > **Run workflow**.

## 6. Deploy

This project deploys with the Vercel CLI (not auto from git). From the repo:

```bash
vercel --prod
```

After it finishes, check:

- `https://www.mountspokanestake.org/emergency-signup` (submit a test offer)
- `https://www.mountspokanestake.org/emergency-signup/admin` (enter the
  password, confirm the test offer shows, try the filter and Export CSV)

## 7. Browsing and querying submissions directly

In the Supabase dashboard you are authenticated, so you can read everything:

- **Table Editor** > `resource_offers` shows all rows, newest filterable and
  sortable in the UI.
- **SQL Editor** lets you run queries. For example, to find everyone who can
  offer a chainsaw:

```sql
select name, phone, resources
from resource_offers
where 'Chainsaw' = any(resources);
```

To see everything newest first:

```sql
select * from resource_offers order by created_at desc;
```

Because `resources` is a `text[]` array, `= any(resources)` is the simple way
to filter by a single resource category.
