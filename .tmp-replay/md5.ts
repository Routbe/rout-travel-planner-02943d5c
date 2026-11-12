import { PGlite } from "@electric-sql/pglite";
import { btree_gist } from "@electric-sql/pglite/contrib/btree_gist";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readFileSync } from "node:fs";
import { listMigrationFiles, planMigrations } from "../scripts/migration-plan";
const db = new PGlite({ extensions: { pgcrypto, btree_gist } });
for (const s of planMigrations(listMigrationFiles("db"), new Set())) {
  if (s.action !== "run") continue;
  await db.exec(`begin;\n${readFileSync(`db/${s.file}`, "utf8")}\n;commit;`);
}
const r = await db.query<{ h: string; n: number }>(`select md5(string_agg(p.proname || ':' || md5(p.prosrc) || ':' || coalesce(array_to_string(p.proacl, ','), ''), '|' order by p.proname)) as h, count(*)::int as n
  from pg_proc p where p.pronamespace = 'public'::regnamespace and (p.proname like 'rout_vp_%' or p.proname like 'rout_promo_%' or p.proname like 'rout_gift_%' or p.proname like 'rout_psp_%' or p.proname like 'rout_pricing_%' or p.proname like 'rout_require_%' or p.proname = 'rout_caller_is_admin')`);
console.log(r.rows[0]);
const r2 = await db.query<{ h: string }>(`select md5(string_agg(p.proname || ':' || md5(p.prosrc), '|' order by p.proname)) as h
  from pg_proc p where p.pronamespace = 'public'::regnamespace and (p.proname like 'rout_vp_%' or p.proname like 'rout_promo_%' or p.proname like 'rout_gift_%' or p.proname like 'rout_psp_%' or p.proname like 'rout_pricing_%' or p.proname like 'rout_require_%' or p.proname = 'rout_caller_is_admin')`);
console.log("src-only", r2.rows[0]);
