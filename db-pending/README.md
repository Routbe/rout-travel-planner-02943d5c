# Held-back migrations

CONTRACT steps that remove legacy access. They stay out of `db/` (every file
there is replayed by the runners) until the deployed app uses the matching
EXPAND functions. Move a file into `db/` only when production runs that code
(the public health probe reports `schema` at or above the EXPAND number).

- `0239_public_profiles_stats_lockdown.sql` — after `db/0238_public_profiles_stats_rpc.sql` code is live on Vercel (health `schema` >= 0238).
- `0241_agenda_jobs_cache_lockdown.sql` — after `db/0240_agenda_jobs_cache_rpc.sql` code is live on Vercel (health `schema` >= 0240).

Applied and moved into `db/`: 0230, 0231, 0233, 0235, 0237 (production reported 0236).
