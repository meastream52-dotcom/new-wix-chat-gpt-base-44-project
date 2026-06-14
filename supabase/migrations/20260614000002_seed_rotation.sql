-- =============================================================================
-- Seed rotation helper function
-- =============================================================================
-- Called by the API route when the player clicks "Rotate Seed".
-- 1. Reveals the current active seed (players can now verify past results).
-- 2. Generates a new active seed.
-- Returns the new seed's hash (shown to player) and the revealed old seed.
-- =============================================================================

create or replace function rotate_server_seed(p_user_id uuid)
returns table (
  old_seed        text,    -- now revealed so player can verify past rounds
  old_hashed_seed text,
  new_hashed_seed text
)
language plpgsql security definer as $$
declare
  v_old_id        uuid;
  v_old_seed      text;
  v_old_hash      text;
  v_new_seed      text;
  v_new_hash      text;
begin
  -- Fetch current active seed
  select id, seed, hashed_seed
  into   v_old_id, v_old_seed, v_old_hash
  from   server_seeds
  where  user_id = p_user_id and active = true
  for    update;

  if not found then
    raise exception 'No active server seed found for user %', p_user_id;
  end if;

  -- Deactivate the old seed (revealing it)
  update server_seeds
  set    active = false
  where  id = v_old_id;

  -- Generate and insert new seed
  v_new_seed := encode(gen_random_bytes(32), 'hex');
  v_new_hash := encode(digest(v_new_seed, 'sha256'), 'hex');

  insert into server_seeds (user_id, hashed_seed, seed, active)
  values (p_user_id, v_new_hash, v_new_seed, true);

  -- Return both so the API route can send them to the client
  return query select v_old_seed, v_old_hash, v_new_hash;
end;
$$;
