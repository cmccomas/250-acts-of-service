import Database from "better-sqlite3";
import path from "path";

const db = new Database(path.resolve("./data/acts.db"));
db.pragma("journal_mode = WAL");

// Clear all existing records
db.exec("DELETE FROM acts_of_service");
console.log("Cleared all existing records.");

db.close();
console.log("Done. Run seed.mjs next.");
