# 250 Acts of Service

A Next.js web app for tracking acts of service as part of the America 250 celebration. Members submit acts of service through a form, an admin reviews and approves them, and the homepage shows progress via dual thermometers (this side / other side of the veil), inspiration cards, and a ward breakdown dashboard.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Turso (libSQL — cloud-hosted SQLite)
- **Auth:** iron-session (cookie-based admin sessions)
- **Hosting:** Vercel

## Project Structure

```
app/page.tsx                — Homepage (thermometers, form, cards, ward dashboard)
app/layout.tsx              — Root layout, metadata, fonts
app/admin/page.tsx          — Admin dashboard (review/approve submissions)
app/admin/login/page.tsx    — Admin login
app/api/                    — API routes (submit, acts, progress, ward-stats, admin/*)
components/                 — SubmissionForm, Thermometer, ActCard, ActsDisplay, WardDashboard, etc.
lib/db.ts                   — Database queries and schema (Turso/libSQL)
lib/types.ts                — TypeScript interfaces
lib/session.ts              — Admin session management
tailwind.config.ts          — Custom theme (forest, gold, charcoal, ivory)
seed.mjs / reseed.mjs       — Database seeding scripts
```

## Commands

- `npm run dev` — Start dev server (or double-click `start-dev.bat`)
- `npm run build` — Production build
- `npx vercel --prod` — Deploy to Vercel (manual CLI deploy, not auto-deploy from git)

## Database

Single table `acts_of_service` in Turso with columns: id, name, email, ward_name, side_of_veil ("this"/"other"), act_description, status ("pending"/"approved"), created_at. Schema is auto-created on first connection via `ensureSchema()` in `lib/db.ts`.

## Environment Variables

Set in `.env.local` (local) and Vercel dashboard (production):
- `TURSO_DB_URL` — Turso database URL
- `TURSO_DB_TOKEN` — Turso auth token
- `ADMIN_PASSWORD` — Password for the admin panel
- `SESSION_SECRET` — Secret for iron-session cookies

## Forking This for Another Stake

This app was built for a specific stake but is designed to be easily adapted. Here's everything to change:

### 1. Ward Names
**`components/SubmissionForm.tsx`** — Edit the `WARD_OPTIONS` array (around line 9) with your stake's ward/branch names.

### 2. Goal Number
- **`app/page.tsx`** — Change `goal={250}` in the `<ThermometerPair>` prop
- **`components/Thermometer.tsx`** — Update the "250 on each side" label text

### 3. Stake Name & Branding
- **`app/page.tsx`** — Header title (~line 19), subtitle text, and footer (~line 70)
- **`app/layout.tsx`** — Page `title` and `description` in metadata

### 4. Example Acts
**`lib/db.ts`** — The `EXAMPLE_ACTS` array (~line 44) contains sample acts shown when the database is empty. Update ward names and descriptions to match your stake.

### 5. Colors (Optional)
**`tailwind.config.ts`** — The theme uses `forest` (green), `gold`, `charcoal`, and `ivory`. Swap the hex values if you want different colors.

### 6. Infrastructure Setup
1. Create a free Turso database at https://turso.tech (sign in with GitHub)
2. Create a Vercel project at https://vercel.com
3. Set the four environment variables in both `.env.local` and Vercel
4. The database table is created automatically on first request
5. Deploy with `npx vercel --prod`

No code changes needed for the database — the schema creates itself.
