import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { listMigrationFiles, planMigrations } from "../scripts/migration-plan";
const db = new PGlite({ extensions: { pgcrypto, btree_gist } });
for (const s of planMigrations(listMigrationFiles("/dev-server/db"), new Set())) {
  if (s.action !== "run") continue;
  await db.exec(`begin;\n${readFileSync(`/dev-server/db/${s.file}`, "utf8")}\n;commit;`);
}
const r = await db.query(`select md5(string_agg(p.proname || ':' || md5(p.prosrc), '|' order by p.proname)) as h, count(*)::int as n
  from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = any($1)`, [process.argv.slice(2)]);
console.log(r.rows[0]);
