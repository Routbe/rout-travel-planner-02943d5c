# ROUT roadmap

- [x] Import repository 1:1 (3,094 files verified)
- [x] Neon owner connection (agent-only) + DATABASE_URL (rout_app) verified
- [x] BETTER_AUTH_SECRET stored
- [x] Batch 3 expand — db/0228_oauth_rpc.sql live on Neon + code uses it (tests: oauth-rpc, purge-read-repair)
- [ ] Batch 3 contract — db-pending/0230_oauth_lockdown.sql, waits until Vercel runs the new code
- [ ] Seal the legacy plaintext signing key (scripts/seal-signing-keys.ts, needs ROUT_PROVIDER_SIGNING_KEK)
- [ ] Batch 4 — payments, vouchers, pricing lockdown (db/0229_payments_and_promos_rpc.sql); inventory done: ~30 files, many no-session webhook/cron/SEPA paths
- [ ] Update roadmap of remaining rout_server tables after batch 3+4
- [ ] Investigate migration drift: 0209/91 checksum differ, 95_question_stories + 0169_workspace_icon renamed
- [ ] Blocked: recovery ceremony (2-of-3) until all rout_server policies are gone
