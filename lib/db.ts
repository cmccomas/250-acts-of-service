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
  return result.rows as unknown as Act[];
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
