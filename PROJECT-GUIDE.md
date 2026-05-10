# 250 Acts of Service — Project Guide

**Last updated:** February 2026

## What Is This?

A web app for the Mount Spokane Stake to track 250 acts of service on each side of the veil as part of the America 250 celebration. Members submit acts of service through a form, an admin reviews and approves them, and the homepage shows progress via dual thermometers, inspiration cards, and a ward breakdown dashboard.

**Live URL:** https://250-acts-of-service.vercel.app
**Repo:** https://github.com/cmccomas/250-acts-of-service

---

## Where Everything Lives

### Local project folder
```
D:\AI Code Projects\250 acts of service
```

### Key files and folders
```
app/page.tsx                  — Homepage (thermometers, form, inspiration cards, ward dashboard)
app/admin/page.tsx            — Admin dashboard (review/approve submissions)
app/admin/login/page.tsx      — Admin login page
app/api/                      — All API routes:
  submit/route.ts               POST — new act submission
  acts/route.ts                 GET  — random approved acts (for inspiration section)
  progress/route.ts             GET  — this_side/other_side counts (for thermometers)
  ward-stats/route.ts           GET  — submission counts by ward (for dashboard)
  admin/login/route.ts          POST — admin login
  admin/logout/route.ts         POST — admin logout
  admin/acts/route.ts           GET  — all pending acts (admin)
  admin/acts/[id]/route.ts      POST — approve or delete a specific act (admin)

components/
  SubmissionForm.tsx            — The main submission form (remembers name/email/ward)
  Thermometer.tsx               — Dual thermometer SVG display
  ActCard.tsx                   — Individual inspiration card (shows ward badge)
  ActsDisplay.tsx               — Grid of inspiration cards with refresh button
  WardDashboard.tsx             — Bar chart of submissions by ward
  AdminActRow.tsx               — Single pending act row in admin view
  AdminLogoutButton.tsx         — Logout button for admin

lib/
  db.ts                         — All database queries (Turso/libSQL)
  types.ts                      — TypeScript interfaces (Act, AdminAct, ProgressCounts, etc.)
  session.ts                    — Admin session management (iron-session)

tailwind.config.ts              — Custom theme colors (forest, gold, charcoal)
.env.local                      — Local environment variables (NOT in git)
start-dev.bat                   — Double-click to start the dev server
```

---

## How to Run It Locally

1. Double-click `start-dev.bat` in the project folder, OR open PowerShell and run:
   ```
   cd "D:\AI Code Projects\250 acts of service"
   npm run dev
   ```
2. Open http://localhost:3000

The local version connects to the same Turso cloud database as production, so changes you make locally (like approving acts) affect the live site.

---

## How to Deploy Changes

After making code changes:

1. Open PowerShell
2. Navigate to the project folder:
   ```
   cd "D:\AI Code Projects\250 acts of service"
   ```
3. Deploy:
   ```
   npx vercel --prod
   ```

That's it. Vercel builds and deploys automatically. Note: automatic deploys from GitHub pushes are NOT currently set up — you must run the CLI command above.

---

## Admin Panel

- **URL:** https://250-acts-of-service.vercel.app/admin
- **Password:** Whatever you set as `ADMIN_PASSWORD` in Vercel's environment variables
- From here you can review pending submissions and approve or delete them
- Admin sessions last 8 hours

---

## Database (Turso)

The database is a cloud-hosted SQLite database on Turso. It stores all acts of service submissions.

- **Turso dashboard:** https://turso.tech (log in with GitHub)
- **Database name:** `acts-of-service`
- **Region:** us-west-2

### Single table: `acts_of_service`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER | Auto-increment primary key |
| name | TEXT | Submitter's name |
| email | TEXT | Submitter's email |
| ward_name | TEXT | One of the 8 wards |
| side_of_veil | TEXT | "this" or "other" |
| act_description | TEXT | What they did |
| status | TEXT | "pending" or "approved" |
| created_at | DATETIME | Auto-set on insert |

### The 8 wards
- Beacon Hill
- Foothills
- Friendship Park
- Greenbluff
- Morgan Acres
- Peone Creek
- Spokane River YSA
- West Valley

---

## Environment Variables

These are set in two places:

### Locally (`.env.local` — already configured)
```
ADMIN_PASSWORD=...
SESSION_SECRET=...
TURSO_DB_URL=libsql://acts-of-service-cmccomas.aws-us-west-2.turso.io
TURSO_DB_TOKEN=...
```

### On Vercel (set via the Vercel dashboard → Project → Settings → Environment Variables)
Same four variables as above. If you need to rotate the Turso token, update it in BOTH places.

---

## Tech Stack

| What | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Turso (libSQL — cloud SQLite) |
| Auth | iron-session (cookie-based admin sessions) |
| Hosting | Vercel |

---

## Things You Might Want To Do

### "I want to change the goal from 250 to something else"
Edit `app/page.tsx` — change the `goal={250}` prop on `<ThermometerPair>`.

### "I want to add or rename a ward"
Edit the `WARD_OPTIONS` array at the top of `components/SubmissionForm.tsx`.

### "I want to change the admin password"
Update `ADMIN_PASSWORD` in both `.env.local` (local) and Vercel dashboard (production).

### "I want to wipe the test data and start fresh"
Go to the Turso dashboard, open the database shell, and run:
```sql
DELETE FROM acts_of_service;
```

### "I want to rotate the Turso token"
1. Go to Turso dashboard → your database → Tokens
2. Revoke the old token, generate a new one
3. Update `TURSO_DB_TOKEN` in `.env.local` AND in Vercel environment variables
4. Redeploy: `npx vercel --prod`

### "I want to keep working with Claude Code"
Open a terminal in the project folder and start a new Claude Code session. Everything is in git, so Claude can read the code and pick up where you left off. Point Claude to this document if it needs context.

---

## Forking This for Another Stake

Want to run this same app for your stake? Here's how:

### Step 1: Get the Code
Fork or clone the repo: `https://github.com/cmccomas/250-acts-of-service`

### Step 2: Install Claude Code
If you don't already have it, install Claude Code. Open the project folder in your terminal and run `claude`. It will read the `CLAUDE.md` file and immediately understand the project.

### Step 3: Tell Claude What to Customize
Just say something like: *"Help me set this up for the [Your Stake Name] Stake. Our wards are [list them]."*

Claude will walk you through updating:
- **Ward names** — `components/SubmissionForm.tsx`, the `WARD_OPTIONS` array
- **Goal number** — `app/page.tsx` (`goal={250}` prop) and `components/Thermometer.tsx` (label text)
- **Stake name** — `app/page.tsx` (header + footer) and `app/layout.tsx` (page title/description)
- **Example acts** — `lib/db.ts`, the `EXAMPLE_ACTS` array (shown when database is empty)
- **Colors** (optional) — `tailwind.config.ts` if you want a different color scheme

### Step 4: Set Up Your Own Infrastructure
1. **Database:** Create a free account at [turso.tech](https://turso.tech) (sign in with GitHub). Create a new database — the table creates itself automatically.
2. **Hosting:** Create a free account at [vercel.com](https://vercel.com). Import the project.
3. **Environment variables:** Set these four in both your local `.env.local` file and in Vercel's dashboard:
   - `TURSO_DB_URL` — your Turso database URL
   - `TURSO_DB_TOKEN` — your Turso auth token
   - `ADMIN_PASSWORD` — whatever you want the admin login password to be
   - `SESSION_SECRET` — any random string (used for cookie encryption)
4. **Deploy:** Run `npx vercel --prod`

### Step 5: You're Live
- Your app is at whatever URL Vercel gives you
- Admin panel is at `/admin`
- Share the link with your stake and start collecting acts of service!

---

## Git Info

- **Branch:** main
- **Remote:** origin → https://github.com/cmccomas/250-acts-of-service.git
- **Author email:** carson@frogbody.com
