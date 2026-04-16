/**
 * Clears all data from the production Turso database.
 * Run with: node clear-production.mjs
 *
 * Requires TURSO_DB_URL and TURSO_DB_TOKEN in .env.local
 */

import { createClient } from "@libsql/client";
import { readFileSync } from "fs";

// Load .env.local
const envFile = readFileSync(".env.local", "utf-8");
const env = {};
for (const line of envFile.split("\n")) {
  const match = line.match(/^(\w+)=(.*)$/);
  if (match) env[match[1]] = match[2];
}

const url = env.TURSO_DB_URL;
const authToken = env.TURSO_DB_TOKEN;

if (!url || !authToken) {
  console.error("Missing TURSO_DB_URL or TURSO_DB_TOKEN in .env.local");
  process.exit(1);
}

const db = createClient({ url, authToken });

// Show current counts before clearing
const before = await db.execute("SELECT COUNT(*) as count FROM acts_of_service");
console.log(`Current records: ${before.rows[0].count}`);

// Clear all records
await db.execute("DELETE FROM acts_of_service");

// Reset the autoincrement counter so new IDs start fresh
await db.execute("DELETE FROM sqlite_sequence WHERE name = 'acts_of_service'");

const after = await db.execute("SELECT COUNT(*) as count FROM acts_of_service");
console.log(`Records after clear: ${after.rows[0].count}`);
console.log("Production database cleared successfully.");
