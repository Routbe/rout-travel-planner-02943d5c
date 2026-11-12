# Held-back migrations

CONTRACT steps that remove legacy access. They stay out of `db/` (every file
there is replayed by the runners) until the deployed app uses the matching
EXPAND functions. Move a file into `db/` only when production runs that code.

- `0230_oauth_lockdown.sql` — after `db/0228_oauth_rpc.sql` code is live on Vercel.
- `0231_payments_lockdown.sql` — after `db/0229_payments_and_promos_rpc.sql` code is live on Vercel.
- `0233_abuse_lockdown.sql` — after `db/0232_abuse_and_stateless_auth_rpc.sql` code is live on Vercel.
- `0235_security_logs_lockdown.sql` — after `db/0234_security_logs_webhooks_rpc.sql` code is live on Vercel.
- `0237_identity_entitlements_lockdown.sql` — after `db/0236_identity_entitlements_rpc.sql` code is live on Vercel.
