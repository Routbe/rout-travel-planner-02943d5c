import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { listMigrationFiles, planMigrations } from "../scripts/migration-plan";
const DB_DIR = "/dev-server/db";
const db = new PGlite({ extensions: { pgcrypto, btree_gist } });
for (const step of planMigrations(listMigrationFiles(DB_DIR), new Set())) {
  if (step.action !== "run") continue;
  const body = readFileSync(join(DB_DIR, step.file), "utf8");
  try { await db.exec(`begin;\n${body}\n;commit;`); }
  catch (e) { await db.exec("rollback").catch(()=>{}); console.log("FAIL", step.file, (e as Error).message); process.exit(1); }
}
console.log("all applied");
const dump = await db.dumpDataDir("none");
writeFileSync("/tmp/replay/db.tar", Buffer.from(await dump.arrayBuffer()));
