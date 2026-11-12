import { neon } from "@neondatabase/serverless";
const client = neon(process.env.DATABASE_URL!.trim(), { fullResults: true });
const flow = `
  do $t$
  declare u uuid; p jsonb; att boolean; c1 boolean; c2 boolean; m text; other boolean; seen int; psp int;
  begin
    select user_id into u from public.verification_payments order by created_at desc limit 1;
    perform set_config('rout.current_user_id', u::text, true);
    p := public.rout_vp_open('stripe', 399, 0, 'none', 'ROUT-4242');
    att := public.rout_vp_attach_ref((p->>'id')::uuid, 'pi_b4test');
    perform set_config('rout.current_user_id', gen_random_uuid()::text, true);
    other := public.rout_vp_fail_own((p->>'id')::uuid);
    perform set_config('rout.current_user_id', '', true);
    c1 := public.rout_vp_claim_paid((p->>'id')::uuid, 'pi_b4test');
    c2 := public.rout_vp_claim_paid((p->>'id')::uuid, 'pi_b4test');
    m := public.rout_vp_mark((p->>'id')::uuid, 'failed', null);
    raise exception 'B4VP status=% attached=% other_member_fail=% claim1=% claim2=% mark_after_paid=%',
      p->>'status', att, other, c1, c2, m;
  end $t$`;
try {
  await client.transaction([client.query("set local role rout_app"), client.query(flow)]);
} catch (e) { console.log(String((e as Error).message)); }
const left = await client.transaction([client.query("set local role rout_app"),
  client.query("select (select count(*) from public.verification_payments where provider_ref = 'pi_b4test')::int as vp, (select count(*) from public.gift_cards where purchaser_email = 'b4test@example.invalid')::int as gifts, (select count(*) from public.promo_codes where code like 'B4TEST-%')::int as promos")]);
console.log("left behind", left[1].rows[0]);
