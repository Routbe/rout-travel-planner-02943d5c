# Held-back migrations

CONTRACT steps that remove legacy access. They stay out of `db/` (every file
there is replayed by the runners) until the deployed app uses the matching
EXPAND functions. Move a file into `db/` only when production runs that code.

- `0230_oauth_lockdown.sql` — after `db/0228_oauth_rpc.sql` code is live on Vercel.
