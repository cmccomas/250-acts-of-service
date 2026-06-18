-- =====================================================================
-- Mount Spokane Stake | Upriver Fire Relief
-- Supabase schema for the resource signup form.
--
-- Run this whole file in the Supabase SQL Editor
-- (Dashboard > your project > SQL Editor > New query > paste > Run).
-- It is safe to run more than once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Table
-- ---------------------------------------------------------------------
create table if not exists public.resource_offers (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  name            text not null,
  email           text not null,
  phone           text not null,
  availability    text,
  resources       text[],          -- the checked resource categories
  other_resources text,
  notes           text
);

-- ---------------------------------------------------------------------
-- 2. Row Level Security
--
-- Enabling RLS with NO select/update/delete policy means the public
-- (anon) key is denied every read by default. We then add exactly one
-- policy: anon may INSERT, nothing else.
--
--   anon key  -> INSERT only (cannot read, update, or delete)
--   service role key -> bypasses RLS entirely (used only server-side
--                       by the admin API route)
--   dashboard (you, authenticated) -> full access
-- ---------------------------------------------------------------------
alter table public.resource_offers enable row level security;

-- Allow anonymous visitors to submit (INSERT) a row.
drop policy if exists "anon can insert resource offers" on public.resource_offers;
create policy "anon can insert resource offers"
  on public.resource_offers
  for insert
  to anon
  with check (true);

-- NOTE: We intentionally create NO policy for SELECT, UPDATE, or DELETE.
-- With RLS enabled, the absence of a policy = denied for the anon role.
-- So a visitor using the public anon key can add their own offer but
-- can never read back anyone's submission (their own included).

-- ---------------------------------------------------------------------
-- 3. Helpful query (run anytime in the SQL Editor or Table Editor)
--
-- Find everyone who offered a chainsaw:
--   select name, phone, resources
--   from public.resource_offers
--   where 'Chainsaw' = any(resources);
-- ---------------------------------------------------------------------
