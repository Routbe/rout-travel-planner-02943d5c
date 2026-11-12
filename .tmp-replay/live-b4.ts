import { sql, withDbContext, databaseTransport } from "../src/lib/neon";
console.log("transport", databaseTransport());
const who = await sql`select current_user as u, (select rolbypassrls from pg_roles where rolname = current_user) as bypass`;
console.log("role", who[0]);
const out: Record<string, unknown> = {};
const tryq = async (k: string, f: () => PromiseLike<unknown>) => {
  try { out[k] = await f(); } catch (e) { out[k] = "ERR " + String((e as Error).message).slice(0, 90); }
};
await tryq("pricing", () => sql`select public.rout_pricing_get() as p`);
await tryq("promo_lookup_unknown", () => sql`select * from public.rout_promo_lookup('ZZ-NOPE-B4')`);
await tryq("promo_admin_list_anon", () => sql`select public.rout_promo_admin_list(5)`);
await tryq("gift_public_unknown", () => sql`select public.rout_gift_card_public('ZZ-NOPE-B4') as c`);
await tryq("gift_mine_anon", () => sql`select public.rout_gift_card_mine()`);
await tryq("psp_public_random", () => sql`select * from public.rout_psp_public_providers(gen_random_uuid())`);
await tryq("vp_paid_sequence", () => sql`select public.rout_vp_paid_sequence(now()) as n`);
await tryq("pricing_set_anon", () => sql`select public.rout_pricing_set(399, 999, 499, 0, 100)`);
await tryq("vp_open_anon", () => sql`select public.rout_vp_open('stripe', 399, 0, 'none', 'ROUT-1234')`);
// Full gift + promo flow under rout_app inside one transaction that always rolls back.
await tryq("gift_flow_rolled_back", () => sql`
  do $t$
  declare g uuid; code text := 'B4TEST-' || substr(md5(random()::text), 1, 8);
          mismatch jsonb; first jsonb; second jsonb; c1 int; c2 int; c3 int; pub jsonb;
  begin
    g := public.rout_gift_card_create(code, 1000, null, 'b4test@example.invalid', null, null, null, null, 'classic', false,
                                      null, null, null, null, null);
    mismatch := public.rout_gift_card_activate(g, 'test', 2, null, 999);
    first := public.rout_gift_card_activate(g, 'test', 2, null, 1000);
    second := public.rout_gift_card_activate(g, 'test', 2, null, 1000);
    select count(*) into c1 from public.rout_promo_redeem(code);
    select count(*) into c2 from public.rout_promo_redeem(code);
    select count(*) into c3 from public.rout_promo_redeem(code);
    pub := public.rout_gift_card_public(code);
    raise exception 'B4RESULT mismatch=% first=% second=% redeem=%,%,% public_has_email=% redeemed=%',
      mismatch->>'outcome', first->>'outcome', second->>'outcome', c1, c2, c3, pub ? 'purchaser_email', pub->>'redeemed';
  end $t$`);
await tryq("gift_flow_left_nothing", () => sql`select count(*)::int as n from public.gift_cards where purchaser_email = 'b4test@example.invalid'`);
console.log(JSON.stringify(out, null, 1));
