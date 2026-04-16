import { createClient } from "@libsql/client";
import type {
  Act,
  AdminAct,
  ProgressCounts,
  SubmissionPayload,
  WardStat,
} from "./types";

function getDb() {
  return createClient({
    url: process.env.TURSO_DB_URL!,
    authToken: process.env.TURSO_DB_TOKEN,
  });
}

// Run once on cold start to ensure schema exists
async function ensureSchema() {
  const db = getDb();
  await db.executeMultiple(`
    CREATE TABLE IF NOT EXISTS acts_of_service (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      name            TEXT    NOT NULL,
      email           TEXT    NOT NULL,
      ward_name       TEXT    NOT NULL,
      side_of_veil    TEXT    NOT NULL CHECK(side_of_veil IN ('this', 'other')),
      act_description TEXT    NOT NULL,
      status          TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved')),
      created_at      DATETIME NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_status ON acts_of_service(status);
    CREATE INDEX IF NOT EXISTS idx_created_at ON acts_of_service(created_at);
  `);
}

let schemaReady: Promise<void> | null = null;
function getReadyDb() {
  if (!schemaReady) schemaReady = ensureSchema();
  return schemaReady.then(() => getDb());
}

// ─── Example acts (shown until enough real submissions exist) ───────────────

const EXAMPLE_ACTS: Act[] = [
  { id: -1, side_of_veil: "this", act_description: "Helped an elderly neighbor carry groceries into their home", ward_name: "Beacon Hill" },
  { id: -2, side_of_veil: "this", act_description: "Made dinner for a family going through a difficult time", ward_name: "Foothills" },
  { id: -3, side_of_veil: "this", act_description: "Volunteered at the local food bank for a morning shift", ward_name: "Greenbluff" },
  { id: -4, side_of_veil: "other", act_description: "Indexed records for a family from a small village in Italy", ward_name: "Morgan Acres" },
  { id: -5, side_of_veil: "other", act_description: "Submitted family names for temple ordinances", ward_name: "Peone Creek" },
  { id: -6, side_of_veil: "other", act_description: "Helped a friend get started with FamilySearch and find new ancestors", ward_name: "West Valley" },
  { id: -7, side_of_veil: "this", act_description: "Shoveled snow from three neighbors' driveways after the storm", ward_name: "Friendship Park" },
  { id: -8, side_of_veil: "other", act_description: "Researched and documented family stories for our family history book", ward_name: "Spokane River YSA" },
  { id: -9, side_of_veil: "this", act_description: "Drove a friend to their doctor's appointment", ward_name: "Beacon Hill" },
  { id: -10, side_of_veil: "other", act_description: "Volunteered as a temple worker for an extra shift this month", ward_name: "Foothills" },
  { id: -11, side_of_veil: "this", act_description: "Brought homemade cookies to the fire station", ward_name: "Greenbluff" },
  { id: -12, side_of_veil: "other", act_description: "Completed ordinances for ancestors who had been waiting over 100 years", ward_name: "Morgan Acres" },
];

function pickRandomExamples(count: number, side?: "this" | "other"): Act[] {
  const pool = side ? EXAMPLE_ACTS.filter(a => a.side_of_veil === side) : EXAMPLE_ACTS;
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// ─── Query functions ────────────────────────────────────────────────────────

export async function insertAct(payload: SubmissionPayload): Promise<void> {
  const db = await getReadyDb();
  await db.execute({
    sql: `INSERT INTO acts_of_service (name, email, ward_name, side_of_veil, act_description)
          VALUES (?, ?, ?, ?, ?)`,
    args: [payload.name, payload.email, payload.ward_name, payload.side_of_veil, payload.act_description],
  });
}

export async function getRandomApprovedActs(
  count = 6,
  side?: "this" | "other"
): Promise<Act[]> {
  const db = await getReadyDb();
  const result = side
    ? await db.execute({
        sql: `SELECT id, side_of_veil, act_description, ward_name
              FROM acts_of_service
              WHERE status = 'approved' AND side_of_veil = ?
              ORDER BY RANDOM() LIMIT ?`,
        args: [side, count],
      })
    : await db.execute({
        sql: `SELECT id, side_of_veil, act_description, ward_name
              FROM acts_of_service
              WHERE status = 'approved'
              ORDER BY RANDOM() LIMIT ?`,
        args: [count],
      });
  const dbActs = result.rows as unknown as Act[];
  if (dbActs.length >= count) return dbActs;
  // Fill remaining slots with examples
  const needed = count - dbActs.length;
  const examples = pickRandomExamples(needed, side).map(a => ({ ...a, isExample: true }));
  return [...dbActs, ...examples];
}

export async function getProgressCounts(): Promise<ProgressCounts> {
  const db = await getReadyDb();
  const result = await db.execute(
    `SELECT side_of_veil, COUNT(*) as count
     FROM acts_of_service
     WHERE status IN ('pending', 'approved')
     GROUP BY side_of_veil`
  );
  const counts: ProgressCounts = { this_side: 0, other_side: 0, total: 0 };
  for (const row of result.rows) {
    if (row.side_of_veil === "this") counts.this_side = Number(row.count);
    if (row.side_of_veil === "other") counts.other_side = Number(row.count);
  }
  counts.total = counts.this_side + counts.other_side;
  return counts;
}

export async function getAllPendingActs(): Promise<AdminAct[]> {
  const db = await getReadyDb();
  const result = await db.execute(
    `SELECT id, name, email, ward_name, side_of_veil, act_description, status, created_at
     FROM acts_of_service
     WHERE status = 'pending'
     ORDER BY created_at ASC`
  );
  return result.rows as unknown as AdminAct[];
}

export async function getAllApprovedActs(): Promise<AdminAct[]> {
  const db = await getReadyDb();
  const result = await db.execute(
    `SELECT id, name, email, ward_name, side_of_veil, act_description, status, created_at
     FROM acts_of_service
     WHERE status = 'approved'
     ORDER BY created_at DESC`
  );
  return result.rows as unknown as AdminAct[];
}

export async function approveAct(id: number): Promise<boolean> {
  const db = await getReadyDb();
  const result = await db.execute({
    sql: `UPDATE acts_of_service SET status = 'approved' WHERE id = ? AND status = 'pending'`,
    args: [id],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export async function deleteAct(id: number): Promise<boolean> {
  const db = await getReadyDb();
  const result = await db.execute({
    sql: `DELETE FROM acts_of_service WHERE id = ?`,
    args: [id],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export async function getWardStats(): Promise<WardStat[]> {
  const db = await getReadyDb();
  const result = await db.execute(
    `SELECT ward_name, COUNT(*) as count
     FROM acts_of_service
     WHERE status IN ('pending', 'approved')
     GROUP BY ward_name
     ORDER BY count DESC`
  );
  return result.rows.map((r) => ({
    ward_name: String(r.ward_name),
    count: Number(r.count),
  }));
}
