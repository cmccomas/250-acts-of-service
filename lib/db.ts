import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import type {
  Act,
  AdminAct,
  ProgressCounts,
  SubmissionPayload,
} from "./types";

const DB_PATH = process.env.DATABASE_PATH ?? "./data/acts.db";

// Singleton pattern — prevents multiple DB instances during Next.js hot reload
declare global {
  // eslint-disable-next-line no-var
  var __db: Database.Database | undefined;
}

function getDb(): Database.Database {
  if (global.__db) return global.__db;

  // Ensure data directory exists
  const resolvedPath = path.resolve(DB_PATH);
  const dir = path.dirname(resolvedPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(resolvedPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  // Initialize schema
  db.exec(`
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

  global.__db = db;
  return db;
}

// ─── Query functions ───────────────────────────────────────────────────────────

export function insertAct(payload: SubmissionPayload): void {
  const db = getDb();
  db.prepare(
    `INSERT INTO acts_of_service (name, email, ward_name, side_of_veil, act_description)
     VALUES (@name, @email, @ward_name, @side_of_veil, @act_description)`
  ).run(payload);
}

export function getRandomApprovedActs(
  count = 6,
  side?: "this" | "other"
): Act[] {
  const db = getDb();
  if (side) {
    return db
      .prepare(
        `SELECT id, side_of_veil, act_description
         FROM acts_of_service
         WHERE status = 'approved' AND side_of_veil = ?
         ORDER BY RANDOM()
         LIMIT ?`
      )
      .all(side, count) as Act[];
  }
  return db
    .prepare(
      `SELECT id, side_of_veil, act_description
       FROM acts_of_service
       WHERE status = 'approved'
       ORDER BY RANDOM()
       LIMIT ?`
    )
    .all(count) as Act[];
}

export function getProgressCounts(): ProgressCounts {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT side_of_veil, COUNT(*) as count
       FROM acts_of_service
       WHERE status IN ('pending', 'approved')
       GROUP BY side_of_veil`
    )
    .all() as { side_of_veil: string; count: number }[];

  const counts: ProgressCounts = { this_side: 0, other_side: 0, total: 0 };
  for (const row of rows) {
    if (row.side_of_veil === "this") counts.this_side = row.count;
    if (row.side_of_veil === "other") counts.other_side = row.count;
  }
  counts.total = counts.this_side + counts.other_side;
  return counts;
}

export function getAllPendingActs(): AdminAct[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, name, email, ward_name, side_of_veil, act_description, status, created_at
       FROM acts_of_service
       WHERE status = 'pending'
       ORDER BY created_at ASC`
    )
    .all() as AdminAct[];
}

export function getAllApprovedActs(): AdminAct[] {
  const db = getDb();
  return db
    .prepare(
      `SELECT id, name, email, ward_name, side_of_veil, act_description, status, created_at
       FROM acts_of_service
       WHERE status = 'approved'
       ORDER BY created_at DESC`
    )
    .all() as AdminAct[];
}

export function approveAct(id: number): boolean {
  const db = getDb();
  const result = db
    .prepare(
      `UPDATE acts_of_service SET status = 'approved' WHERE id = ? AND status = 'pending'`
    )
    .run(id);
  return result.changes > 0;
}

export function deleteAct(id: number): boolean {
  // Hard delete — row is permanently removed, never counted
  const db = getDb();
  const result = db
    .prepare(`DELETE FROM acts_of_service WHERE id = ?`)
    .run(id);
  return result.changes > 0;
}
