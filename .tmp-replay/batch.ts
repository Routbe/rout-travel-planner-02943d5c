import { readFileSync, writeFileSync } from "node:fs";
import { checksumOf, splitSql } from "../scripts/migration-plan";
const f = process.argv[2]!;
const body = readFileSync(`db/${f}`, "utf8");
const queries = [...splitSql(body).map((query) => ({ query, params: [] })),
  { query: "insert into public.schema_migrations (filename, checksum) values ($1, $2)", params: [f, checksumOf(body)] }];
writeFileSync(`/tmp/${f}.json`, JSON.stringify({ queries }));
console.log(queries.length, JSON.stringify({ queries }).length);
