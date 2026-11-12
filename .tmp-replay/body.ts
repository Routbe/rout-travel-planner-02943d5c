import { readFileSync, writeFileSync } from "node:fs";
import { checksumOf, splitSql } from "../scripts/migration-plan";
const file = process.argv[2]!;
const body = readFileSync(`db/${file}`, "utf8");
const queries = [...splitSql(body).map((query) => ({ query, params: [] as unknown[] })),
  { query: "insert into public.schema_migrations (filename, checksum) values ($1, $2)", params: [file, checksumOf(body)] }];
writeFileSync(`/tmp/${file}.json`, JSON.stringify({ queries }));
console.log(queries.length, "statements", JSON.stringify({ queries }).length, "bytes", checksumOf(body));
