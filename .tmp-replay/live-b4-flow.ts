import { neon } from "@neondatabase/serverless";
const client = neon(process.env.DATABASE_URL!.trim(), { fullResults: true });
const flow = `
  do $t$
  declare g uuid; code text := 'B4TEST-' || substr(md5(random()::text), 1, 8);
          mismatch jsonb; first jsonb; second jsonb; c1 int; c2 int; c3 int; pub jsonb; mine int;
  begin
    perform set_config('rout.current_user_id', '', true);
    g := public.rout_gift_card_create(code, 1000, null, 'b4test@example.invalid', null, null, null, null, 'classic', false,
                                      null, null, null, null, null);
    mismatch := public.rout_gift_card_activate(g, 'test', 2, null, 999);
    first := public.rout_gift_card_activate(g, 'test', 2, null, 1000);
    second := public.rout_gift_card_activate(g, 'test', 2, null, 1000);
    select count(*) into c1 from public.rout_promo_redeem(code);
    select count(*) into c2 from public.rout_promo_redeem(code);
    select count(*) into c3 from public.rout_promo_redeem(code);
    pub := public.rout_gift_card_public(code);
    raise exception 'B4RESULT user=% mismatch=% first=% second=% redeem=%,%,% public_has_email=% redeemed=%',
      current_user, mismatch->>'outcome', first->>'outcome', second->>'outcome', c1, c2, c3, pub ? 'purchaser_email', pub->>'redeemed';
  end $t$`;
try {
  await client.transaction([client.query("set local role rout_app"), client.query(flow)]);
} catch (e) { console.log(String((e as Error).message)); }
